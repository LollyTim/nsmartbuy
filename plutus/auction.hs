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

module TrustEcom.Auction where

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
import           Ledger.Ada           as Ada
import           Prelude              (Semigroup (..), Show (..), String)

-- | Auction datum containing auction information
data AuctionDatum = AuctionDatum
    { adSeller         :: !PubKeyHash  -- ^ Seller's public key hash
    , adHighestBidder  :: !(Maybe PubKeyHash) -- ^ Current highest bidder (if any)
    , adHighestBid     :: !Integer     -- ^ Current highest bid in lovelace
    , adMinBid         :: !Integer     -- ^ Minimum bid increment
    , adStartTime      :: !POSIXTime   -- ^ Auction start time
    , adEndTime        :: !POSIXTime   -- ^ Auction end time
    , adProductName    :: !BuiltinByteString -- ^ Product name
    , adMetadataUrl    :: !BuiltinByteString -- ^ IPFS URL for product metadata
    , adTokenPolicy    :: !CurrencySymbol -- ^ Policy ID for the NFT
    , adTokenName      :: !BuiltinByteString -- ^ Token name for the NFT
    }
    deriving (Show, Generic, FromJSON, ToJSON)

PlutusTx.makeIsDataIndexed ''AuctionDatum [('AuctionDatum, 0)]
PlutusTx.makeLift ''AuctionDatum

-- | Auction redeemer for different actions
data AuctionRedeemer = Bid PubKeyHash Integer | Close | Cancel
    deriving (Show, Generic, FromJSON, ToJSON)

PlutusTx.makeIsDataIndexed ''AuctionRedeemer [('Bid, 0), ('Close, 1), ('Cancel, 2)]
PlutusTx.makeLift ''AuctionRedeemer

-- | Auction validator script
{-# INLINABLE mkAuctionValidator #-}
mkAuctionValidator :: AuctionDatum -> AuctionRedeemer -> ScriptContext -> Bool
mkAuctionValidator dat red ctx =
    case red of
        Bid bidder bidAmount -> 
               traceIfFalse "Auction not started yet" auctionStarted
            && traceIfFalse "Auction already ended" auctionNotEnded
            && traceIfFalse "Bid too low" (bidAmount > adHighestBid dat + adMinBid dat)
            && traceIfFalse "Incorrect bid payment" correctBidPayment
            && traceIfFalse "Incorrect datum update" correctDatumUpdate
        Close -> 
               traceIfFalse "Auction not ended yet" auctionEnded
            && traceIfFalse "Incorrect payment to seller" correctPaymentToSeller
            && traceIfFalse "Incorrect NFT transfer" correctNFTTransfer
        Cancel -> 
               traceIfFalse "Not signed by seller" signedBySeller
            && traceIfFalse "Bids already placed" noBidsPlaced
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    signedBySeller :: Bool
    signedBySeller = txSignedBy info $ adSeller dat

    auctionStarted :: Bool
    auctionStarted = from (adStartTime dat) `contains` txInfoValidRange info

    auctionNotEnded :: Bool
    auctionNotEnded = to (adEndTime dat) `contains` txInfoValidRange info

    auctionEnded :: Bool
    auctionEnded = from (adEndTime dat) `contains` txInfoValidRange info

    noBidsPlaced :: Bool
    noBidsPlaced = isNothing $ adHighestBidder dat

    correctBidPayment :: Bool
    correctBidPayment = case red of
        Bid _ bidAmount -> 
            let val = Ada.lovelaceValueOf bidAmount
                -- Check if the script receives the bid amount
                scriptOutputs = scriptOutputsAt (ownHash ctx) info
                scriptValue = mconcat $ map (txOutValue . txOutTxOut . snd) scriptOutputs
            in scriptValue `geq` val
        _ -> True

    correctDatumUpdate :: Bool
    correctDatumUpdate = case red of
        Bid bidder bidAmount ->
            let scriptOutputs = scriptOutputsAt (ownHash ctx) info
                newDatums = map (snd . snd) scriptOutputs
            in case newDatums of
                [d] -> case PlutusTx.fromBuiltinData d of
                    Just newDat -> adHighestBidder newDat == Just bidder && 
                                  adHighestBid newDat == bidAmount
                    Nothing -> False
                _ -> False
        _ -> True

    correctPaymentToSeller :: Bool
    correctPaymentToSeller = case red of
        Close ->
            let expectedPayment = Ada.lovelaceValueOf $ adHighestBid dat
                sellerPkh = adSeller dat
                outputs = txInfoOutputs info
                sellerOutputs = filter (\o -> txOutAddress o == pubKeyHashAddress sellerPkh Nothing) outputs
                sellerValue = mconcat $ map txOutValue sellerOutputs
            in sellerValue `geq` expectedPayment
        _ -> True

    correctNFTTransfer :: Bool
    correctNFTTransfer = case red of
        Close ->
            let policyId = adTokenPolicy dat
                tokenName = TokenName $ adTokenName dat
                nftValue = Value.singleton policyId tokenName 1
                winnerPkh = fromMaybe (adSeller dat) $ adHighestBidder dat
                outputs = txInfoOutputs info
                winnerOutputs = filter (\o -> txOutAddress o == pubKeyHashAddress winnerPkh Nothing) outputs
                winnerValue = mconcat $ map txOutValue winnerOutputs
            in winnerValue `geq` nftValue
        _ -> True

    ownHash :: ScriptContext -> ValidatorHash
    ownHash = Scripts.validatorHash . scriptContextValidator

-- | Auction validator script instance
data Auction
instance Scripts.ValidatorTypes Auction where
    type instance DatumType Auction = AuctionDatum
    type instance RedeemerType Auction = AuctionRedeemer

typedAuctionValidator :: Scripts.TypedValidator Auction
typedAuctionValidator = Scripts.mkTypedValidator @Auction
    $$(PlutusTx.compile [|| mkAuctionValidator ||])
    $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @AuctionDatum @AuctionRedeemer

auctionValidator :: Validator
auctionValidator = Scripts.validatorScript typedAuctionValidator

auctionAddress :: Ledger.Address
auctionAddress = scriptAddress auctionValidator

-- | Create an auction
createAuction :: AsContractError e => PubKeyHash -> Integer -> Integer -> POSIXTime -> POSIXTime -> BuiltinByteString -> BuiltinByteString -> CurrencySymbol -> TokenName -> Contract w s e ()
createAuction seller startingBid minBidIncrement startTime endTime productName metadataUrl policyId tokenName = do
    let datum = AuctionDatum
            { adSeller = seller
            , adHighestBidder = Nothing
            , adHighestBid = startingBid
            , adMinBid = minBidIncrement
            , adStartTime = startTime
            , adEndTime = endTime
            , adProductName = productName
            , adMetadataUrl = metadataUrl
            , adTokenPolicy = policyId
            , adTokenName = unTokenName tokenName
            }
        val = Value.singleton policyId tokenName 1
        lookups = Constraints.typedValidatorLookups typedAuctionValidator
        tx = Constraints.mustPayToTheScript datum val
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

-- | Place a bid on an auction
placeBid :: AsContractError e => TxOutRef -> AuctionDatum -> PubKeyHash -> Integer -> Contract w s e ()
placeBid oref dat bidder bidAmount = do
    let redeemer = Bid bidder bidAmount
        newDatum = dat { adHighestBidder = Just bidder, adHighestBid = bidAmount }
        val = Ada.lovelaceValueOf bidAmount <> Value.singleton (adTokenPolicy dat) (TokenName $ adTokenName dat) 1
        lookups = Constraints.typedValidatorLookups typedAuctionValidator <>
                  Constraints.otherScript auctionValidator <>
                  Constraints.unspentOutputs (Map.singleton oref val)
        tx = Constraints.mustSpendScriptOutput oref redeemer <>
             Constraints.mustPayToTheScript newDatum val <>
             Constraints.mustValidateIn (to $ adEndTime dat) <>
             Constraints.mustBeSignedBy bidder
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

-- | Close an auction after it has ended
closeAuction :: AsContractError e => TxOutRef -> AuctionDatum -> Contract w s e ()
closeAuction oref dat = do
    let redeemer = Close
        policyId = adTokenPolicy dat
        tokenName = TokenName $ adTokenName dat
        nftValue = Value.singleton policyId tokenName 1
        winnerPkh = fromMaybe (adSeller dat) $ adHighestBidder dat
        lookups = Constraints.typedValidatorLookups typedAuctionValidator <>
                  Constraints.otherScript auctionValidator <>
                  Constraints.unspentOutputs (Map.singleton oref (nftValue <> Ada.lovelaceValueOf (adHighestBid dat)))
        tx = Constraints.mustSpendScriptOutput oref redeemer <>
             Constraints.mustPayToPubKey (adSeller dat) (Ada.lovelaceValueOf $ adHighestBid dat) <>
             Constraints.mustPayToPubKey winnerPkh nftValue <>
             Constraints.mustValidateIn (from $ adEndTime dat)
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

-- | Cancel an auction (only if no bids have been placed)
cancelAuction :: AsContractError e => TxOutRef -> AuctionDatum -> Contract w s e ()
cancelAuction oref dat = do
    let redeemer = Cancel
        policyId = adTokenPolicy dat
        tokenName = TokenName $ adTokenName dat
        nftValue = Value.singleton policyId tokenName 1
        lookups = Constraints.typedValidatorLookups typedAuctionValidator <>
                  Constraints.otherScript auctionValidator <>
                  Constraints.unspentOutputs (Map.singleton oref nftValue)
        tx = Constraints.mustSpendScriptOutput oref redeemer <>
             Constraints.mustPayToPubKey (adSeller dat) nftValue <>
             Constraints.mustBeSignedBy (adSeller dat)
    ledgerTx <- submitTxConstraintsWith lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx

