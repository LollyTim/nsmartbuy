{-# LANGUAGE DataKinds           #-}
{-# LANGUAGE DeriveAnyClass      #-}
{-# LANGUAGE DeriveGeneric       #-}
{-# LANGUAGE FlexibleContexts    #-}
{-# LANGUAGE NoImplicitPrelude   #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell     #-}
{-# LANGUAGE TypeApplications    #-}
{-# LANGUAGE TypeFamilies        #-}
{-# LANGUAGE TypeOperators       #-}

module TrustEcom.Marketplace where

import           Control.Monad        hiding (fmap)
import           Data.Aeson           (FromJSON, ToJSON)
import qualified Data.Map             as Map
import           Data.Text            (Text)
import           Data.Void            (Void)
import           GHC.Generics         (Generic)
import           Plutus.Contract
import qualified PlutusTx
import           PlutusTx.Prelude     hiding (Semigroup(..), unless)
import           Ledger               hiding (singleton)
import           Ledger.Constraints   as Constraints
import qualified Ledger.Typed.Scripts as Scripts
import           Ledger.Value         as Value
import           Prelude              (Semigroup (..), Show (..), String)

-- | Marketplace datum containing product information
data MarketplaceDatum = MarketplaceDatum
    { mdSeller         :: !PubKeyHash  -- ^ Seller's public key hash
    , mdPrice          :: !Integer     -- ^ Price in lovelace
    , mdProductName    :: !BuiltinByteString -- ^ Product name
    , mdMetadataUrl    :: !BuiltinByteString -- ^ IPFS URL for product metadata
    , mdTokenName      :: !BuiltinByteString -- ^ Token name for the NFT
    , mdTokenPolicy    :: !CurrencySymbol -- ^ Policy ID for the NFT
    }
    deriving (Show, Generic, FromJSON, ToJSON)

PlutusTx.makeIsDataIndexed ''MarketplaceDatum [('MarketplaceDatum, 0)]
PlutusTx.makeLift ''MarketplaceDatum

-- | Marketplace redeemer for different actions
data MarketplaceRedeemer = Buy | Cancel
    deriving (Show, Generic, FromJSON, ToJSON)

PlutusTx.makeIsDataIndexed ''MarketplaceRedeemer [('Buy, 0), ('Cancel, 1)]
PlutusTx.makeLift ''MarketplaceRedeemer

-- | Marketplace validator script
{-# INLINABLE mkMarketplaceValidator #-}
mkMarketplaceValidator :: MarketplaceDatum -> MarketplaceRedeemer -> ScriptContext -> Bool
mkMarketplaceValidator dat red ctx =
    case red of
        Buy    -> traceIfFalse "Incorrect payment to seller" correctPaymentToSeller
        Cancel -> traceIfFalse "Not signed by seller" signedBySeller
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    signedBySeller :: Bool
    signedBySeller = txSignedBy info $ mdSeller dat

    correctPaymentToSeller :: Bool
    correctPaymentToSeller = 
        let expectedPayment = Ada.lovelaceValueOf $ mdPrice dat
            sellerPkh = mdSeller dat
            outputs = txInfoOutputs info
            sellerOutputs = filter (\o -> txOutAddress o == pubKeyHashAddress sellerPkh Nothing) outputs
            sellerValue = mconcat $ map txOutValue sellerOutputs
        in sellerValue `geq` expectedPayment

-- | Marketplace validator script instance
data Marketplace
instance Scripts.ValidatorTypes Marketplace where
    type instance DatumType Marketplace = MarketplaceDatum
    type instance RedeemerType Marketplace = MarketplaceRedeemer

typedMarketplaceValidator :: Scripts.TypedValidator Marketplace
typedMarketplaceValidator = Scripts.mkTypedValidator @Marketplace
    $$(PlutusTx.compile [|| mkMarketplaceValidator ||])
    $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @MarketplaceDatum @MarketplaceRedeemer

marketplaceValidator :: Validator
marketplaceValidator = Scripts.validatorScript typedMarketplaceValidator

marketplaceAddress :: Ledger.Address
marketplaceAddress = scriptAddress marketplaceValidator

-- | Create a marketplace listing
listProduct :: AsContractError e => PubKeyHash -> Integer -> BuiltinByteString -> BuiltinByteString -> CurrencySymbol -> TokenName -> Contract w s e ()
listProduct seller price productName metadataUrl policyId tokenName = do
    let datum = MarketplaceDatum
            { mdSeller = seller
            , mdPrice = price
            , mdProductName = productName
            , mdMetadataUrl = metadataUrl
            , mdTokenPolicy = policyId
            , mdTokenName = unTokenName tokenName
            }
        val = Value.singleton policyId tokenName 1
        lookups = Constraints.typedValidatorLookups typedMarketplaceValidator
        tx = Constraints.mustPayToTheScript datum val
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

-- | Buy a product from the marketplace
buyProduct :: AsContractError e => MarketplaceDatum -> Contract w s e ()
buyProduct dat = do
    let price = mdPrice dat
        seller = mdSeller dat
        policyId = mdTokenPolicy dat
        tokenName = TokenName $ mdTokenName dat
        val = Value.singleton policyId tokenName 1
        redeemer = Buy
        lookups = Constraints.typedValidatorLookups typedMarketplaceValidator <>
                  Constraints.otherScript marketplaceValidator
        tx = Constraints.mustSpendScriptOutput (marketplaceAddress, redeemer) <>
             Constraints.mustPayToPubKey seller (Ada.lovelaceValueOf price)
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

-- | Cancel a marketplace listing
cancelListing :: AsContractError e => TxOutRef -> MarketplaceDatum -> Contract w s e ()
cancelListing oref dat = do
    let policyId = mdTokenPolicy dat
        tokenName = TokenName $ mdTokenName dat
        val = Value.singleton policyId tokenName 1
        redeemer = Cancel
        lookups = Constraints.typedValidatorLookups typedMarketplaceValidator <>
                  Constraints.otherScript marketplaceValidator <>
                  Constraints.unspentOutputs (Map.singleton oref val)
        tx = Constraints.mustSpendScriptOutput oref redeemer <>
             Constraints.mustBeSignedBy (mdSeller dat)
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

