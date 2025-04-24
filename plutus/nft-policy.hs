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

module TrustEcom.NFTPolicy where

import           Control.Monad        hiding (fmap)
import           Data.Aeson           (FromJSON, ToJSON)
import qualified Data.ByteString.Char8 as C
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

-- | NFT policy parameters
data NFTParams = NFTParams
    { npTokenName :: !BuiltinByteString  -- ^ Token name
    , npOwner     :: !PubKeyHash         -- ^ Owner's public key hash
    , npMetadata  :: !BuiltinByteString  -- ^ IPFS metadata URL
    , npUtxo      :: !TxOutRef           -- ^ UTxO used for policy uniqueness
    }

PlutusTx.makeLift ''NFTParams

-- | NFT minting policy
{-# INLINABLE mkNFTPolicy #-}
mkNFTPolicy :: NFTParams -> () -> ScriptContext -> Bool
mkNFTPolicy params _ ctx =
    traceIfFalse "UTxO not consumed" hasUTxO &&
    traceIfFalse "Wrong amount minted" checkMintedAmount &&
    traceIfFalse "Not signed by owner" signedByOwner
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    hasUTxO :: Bool
    hasUTxO = any (\i -> txInInfoOutRef i == npUtxo params) $ txInfoInputs info

    checkMintedAmount :: Bool
    checkMintedAmount = case flattenValue (txInfoMint info) of
        [(_, tn', amt)] -> tn' == npTokenName params && amt == 1
        _               -> False

    signedByOwner :: Bool
    signedByOwner = txSignedBy info $ npOwner params

-- | Create the NFT policy script
nftPolicy :: NFTParams -> Scripts.MintingPolicy
nftPolicy params = mkMintingPolicyScript $
    $$(PlutusTx.compile [|| \p -> Scripts.wrapMintingPolicy (mkNFTPolicy p) ||])
    `PlutusTx.applyCode`
    PlutusTx.liftCode params

-- | Get the currency symbol (policy ID) for the NFT policy
nftCurrencySymbol :: NFTParams -> CurrencySymbol
nftCurrencySymbol = scriptCurrencySymbol . nftPolicy

-- | Mint an NFT with the given parameters
mintNFT :: AsContractError e => NFTParams -> Contract w s e ()
mintNFT params = do
    let tokenName = TokenName $ npTokenName params
        cs = nftCurrencySymbol params
        val = Value.singleton cs tokenName 1
        lookups = Constraints.mintingPolicy (nftPolicy params) <>
                  Constraints.unspentOutputs (Map.singleton (npUtxo params) (Ada.lovelaceValueOf 2000000))
        tx = Constraints.mustMintValue val <>
             Constraints.mustSpendPubKeyOutput (npUtxo params) <>
             Constraints.mustBeSignedBy (npOwner params)
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

