import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
    input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: #7c2d2d;
  padding: 10px;
  font-weight: bold;
width:200px !important;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
margin-top:10px;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 150px;
  @media (min-width: 767px) {
    width: 200px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 100px;
  @media (min-width: 900px) {
    width: 150px;
  }
  @media (min-width: 1000px) {
    width: 200px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
    const dispatch = useDispatch();
    const oneEther = 1000000000000000000;
    const blockchain = useSelector((state) => state.blockchain);
    const data = useSelector((state) => state.data);
    const [claimingNft, setClaimingNft] = useState(false);
    const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
    const [mintAmount, setMintAmount] = useState(1);
    const [newCost, setCost] = useState("0.06");

    const [CONFIG, SET_CONFIG] = useState({
        CONTRACT_ADDRESS: "",
        SCAN_LINK: "",
        NETWORK: {
            NAME: "",
            SYMBOL: "",
            ID: 0,
        },
        NFT_NAME: "",
        SYMBOL: "",
        MAX_SUPPLY: 1,
        WEI_COST: 0,
        DISPLAY_COST: 0,
        GAS_LIMIT: 0,
        MARKETPLACE: "",
        MARKETPLACE_LINK: "",
        SHOW_BACKGROUND: false,
    });

    const claimNFTs = () => {
        let gasLimit = CONFIG.GAS_LIMIT;

        let totalGasLimit = String(gasLimit * mintAmount);

        console.log("Gas limit: ", totalGasLimit);
        setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
        setClaimingNft(true);
        blockchain.smartContract.methods.
            cost().
            call()
            .then(function (info) {
                let totalCostWei = String(info * mintAmount);
                blockchain.smartContract.methods
                    .mint(mintAmount)
                    .send({
                        gasLimit: String(gasLimit),
                        to: CONFIG.CONTRACT_ADDRESS,
                        from: blockchain.account,
                        value: totalCostWei,
                    })
                    .once("error", (err) => {
                        setFeedback("Opps not whitelisted or max mint amount reached.");
                        setClaimingNft(false);
                    })
                    .then((receipt) => {
                        console.log(receipt);
                        setFeedback(
                            `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
                        );
                        setClaimingNft(false);
                        dispatch(fetchData(blockchain.account));
                    });
            });




    };
    const giveawayNft = () => {
        let gasLimit = CONFIG.GAS_LIMIT;

        let totalGasLimit = String(gasLimit);
        let address = document.getElementById("giveawayNft").value

        console.log("Gas limit: ", totalGasLimit);
        setFeedback(`giving away ${CONFIG.NFT_NAME}...`);
        setClaimingNft(true);


        blockchain.smartContract.methods
            .mintForAddress(1, address)
            .send({
                gasLimit: String(totalGasLimit),
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                setFeedback("Opps not whitelisted or max mint amount reached.");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `WOW, the ${CONFIG.NFT_NAME} sent to ${address}`
                );
                setClaimingNft(false);
                dispatch(fetchData(blockchain.account));
            });





    };

    const revealNfts = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        blockchain.smartContract.methods
            .reveal()
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Not revealead");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `revealed`
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const withdraw = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        blockchain.smartContract.methods
            .withdraw()
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Not revealead");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `revealed`
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const maxMintPertrx = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let maxMint = document.getElementById("maxMintPertrx").value
        blockchain.smartContract.methods
            .setMaxMintAmountPerTx(maxMint)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Not revealead");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `revealed`
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const setMaxMintperWallet = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let maxMint = document.getElementById("setMaxMintperWallet").value
        blockchain.smartContract.methods
            .setMaxMintperWallet(maxMint)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Not revealead");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `revealed`
                );

                dispatch(fetchData(blockchain.account));
            });

    }

    const unlimitedMintAddress = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let address = document.getElementById("unlimitedMint").value
        blockchain.smartContract.methods
            .unlimitedMintAddress(address)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Error in adding address for unlimited mint");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `address added for unlimited mint`
                );

                dispatch(fetchData(blockchain.account));
            });

    }

    const removeunlimitedMintAddress = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let address = document.getElementById("removedunlimitedMint").value
        blockchain.smartContract.methods
            .removeUnlimitedMintAddress(address)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Error in adding address for unlimited mint");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `address added for unlimited mint`
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const addWhitelistaddress = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let address = document.getElementById("addWhitelistaddress").value
        var array = address.split(',');
        blockchain.smartContract.methods
            .addToWhitelist(array)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Error in adding address for unlimited mint");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `address added for unlimited mint`
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const removeWhitelistaddress = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let address = document.getElementById("removeWhitelistaddress").value
        var array = address.split(',');
        blockchain.smartContract.methods
            .removeFromWhitelist(array)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Error in adding address for unlimited mint");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `address added for unlimited mint`
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const setBaseURI = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let baseUri = document.getElementById("setBaseURI").value
        blockchain.smartContract.methods
            .setBaseURI(baseUri)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("cant set metadata");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `Metadata Updated`
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const setPausedTrue = () => {
        let gasLimit = CONFIG.GAS_LIMIT;

        blockchain.smartContract.methods
            .setPaused(true)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("error");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `contract paused `
                );

                dispatch(fetchData(blockchain.account));
            });

    }
    const setPausedFalse = () => {
        let gasLimit = CONFIG.GAS_LIMIT;

        blockchain.smartContract.methods
            .setPaused(false)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("error");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `contract paused `
                );

                dispatch(fetchData(blockchain.account));
            });

    }

    const setNewCost = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        let cost = CONFIG.WEI_COST;
        let totalNewCost = String(oneEther * newCost);
        blockchain.smartContract.methods
            .setCost(totalNewCost)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("oops");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `New Cost is ${CONFIG.NFT_NAME}`
                );

                dispatch(fetchData(blockchain.account));
            });

    }

    const showCost = () => {

        blockchain.smartContract.methods.
            cost().
            call()
            .then(function (info) {
                console.log("info: ", info);
                document.getElementById('lastInfo').innerHTML = parseFloat(info).toFixed(3) / oneEther + "ether";
            });
    }

    const setWhitelistOn = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        blockchain.smartContract.methods.
            setWhitelistMintEnabled(true)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })

    }


    const setWhitelistOff = () => {
        let gasLimit = CONFIG.GAS_LIMIT;
        blockchain.smartContract.methods.
            setWhitelistMintEnabled(false)
            .send({
                gasLimit: gasLimit,
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: 0,
            })

    }




    const decrementMintAmount = () => {
        let newMintAmount = mintAmount - 1;
        if (newMintAmount < 1) {
            newMintAmount = 1;
        }
        setMintAmount(newMintAmount);
    };


    const incrementMintAmount = () => {
        let newMintAmount = mintAmount + 1;
        if (newMintAmount > 2) {
            newMintAmount = 2;
        }
        setMintAmount(newMintAmount);
    };


    const decrementCostAmount = () => {

        let newCostAmount = parseFloat((newCost * oneEther - 0.001 * oneEther) / oneEther).toFixed(4);
        if (newCostAmount < 0) {
            newCostAmount = 0;
        }
        setCost(newCostAmount);
    };

    const incrementCostAmount = () => {
        let newCostAmount = parseFloat((newCost * oneEther + 0.001 * oneEther) / oneEther).toFixed(4);
        if (newCostAmount > 100) {
            newCostAmount = 100;
        }
        setCost(newCostAmount);
    };



    const getData = () => {
        if (blockchain.account !== "" && blockchain.smartContract !== null) {
            dispatch(fetchData(blockchain.account));
        }
    };

    const getConfig = async () => {
        const configResponse = await fetch("/config/config.json", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        const config = await configResponse.json();
        SET_CONFIG(config);
    };

    useEffect(() => {
        getConfig();
    }, []);

    useEffect(() => {
        getData();
    }, [blockchain.account]);

    return (
        <s.Screen>
            <s.Container
                flex={1}
                ai={"center"}
                style={{ padding: 24, backgroundColor: "#302e1e" }}

            >
                <StyledLogo alt={"logo"} src={"https://gateway.pinata.cloud/ipfs/QmY3NRXq2n1WtztkRXnaC4bH4UbNo5kFSy5ZWwN6Fx9xQ5/1.gif"} />
                <s.SpacerSmall />
                <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>

                    <s.SpacerLarge />
                    <s.Container
                        flex={2}
                        jc={"center"}
                        ai={"center"}
                        style={{
                            backgroundColor: "var(--accent)",
                            padding: 24,
                            borderRadius: 24,
                            border: "4px dashed var(--secondary)",
                            boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
                        }}
                    >
                        <s.TextTitle
                            style={{
                                textAlign: "center",
                                fontSize: 50,
                                fontWeight: "bold",
                                color: "var(--accent-text)",
                            }}
                        >
                            {data.totalSupply} / {CONFIG.MAX_SUPPLY}
                        </s.TextTitle>
                        <s.TextDescription
                            style={{
                                textAlign: "center",
                                color: "var(--primary-text)",
                            }}
                        >
                            <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
                            </StyledLink>
                        </s.TextDescription>
                        <s.SpacerSmall />
                        {Number(data.totalSupply - 2) >= CONFIG.MAX_SUPPLY ? (
                            <>
                                <s.TextTitle
                                    style={{ textAlign: "center", color: "var(--accent-text)" }}
                                >
                                    The sale has ended.
                                </s.TextTitle>
                                <s.TextDescription
                                    style={{ textAlign: "center", color: "var(--accent-text)" }}
                                >
                                    You can still find {CONFIG.NFT_NAME} on
                                </s.TextDescription>
                                <s.SpacerSmall />
                                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                                    {CONFIG.MARKETPLACE}
                                </StyledLink>
                            </>
                        ) : (
                            <>
                                <s.TextTitle
                                    style={{ textAlign: "center", color: "var(--accent-text)" }}
                                >
                                    1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                                    {CONFIG.NETWORK.SYMBOL}.
                                </s.TextTitle><s.TextTitle
                                    style={{ textAlign: "center", color: "var(--accent-text)" }}
                                >
                                    Max 4 NFT per wallet.
                                </s.TextTitle>
                                <s.SpacerXSmall />
                                <s.TextDescription
                                    style={{ textAlign: "center", color: "var(--accent-text)" }}
                                >

                                </s.TextDescription>
                                <s.SpacerSmall />
                                {blockchain.account === "" ||
                                    blockchain.smartContract === null ? (
                                    <s.Container ai={"center"} jc={"center"}>
                                        <s.TextDescription
                                            style={{
                                                textAlign: "center",
                                                color: "var(--accent-text)",
                                            }}
                                        >
                                            Connect to the {CONFIG.NETWORK.NAME} network
                                        </s.TextDescription>
                                        <s.SpacerSmall />
                                        <StyledButton
                                            onClick={(e) => {
                                                e.preventDefault();
                                                dispatch(connect());
                                                getData();
                                            }}
                                        >
                                            CONNECT
                                        </StyledButton>
                                        {blockchain.errorMsg !== "" ? (
                                            <>
                                                <s.SpacerSmall />
                                                <s.TextDescription
                                                    style={{
                                                        textAlign: "center",
                                                        color: "var(--accent-text)",
                                                    }}
                                                >
                                                    {blockchain.errorMsg}
                                                </s.TextDescription>
                                            </>
                                        ) : null}
                                    </s.Container>
                                ) : (
                                    <>
                                        <s.TextDescription
                                            style={{
                                                textAlign: "center",
                                                color: "var(--accent-text)",
                                            }}
                                        >
                                            {feedback}
                                        </s.TextDescription>
                                        <s.SpacerMedium />


                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>

                                            <StyledRoundButton
                                                style={{ lineHeight: 0.4 }}
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    decrementMintAmount();
                                                }}
                                            >
                                                -
                                            </StyledRoundButton>
                                            <s.SpacerMedium />
                                            <s.TextDescription
                                                style={{
                                                    textAlign: "center",
                                                    color: "var(--accent-text)",
                                                }}
                                            >
                                                {mintAmount}
                                            </s.TextDescription>
                                            <s.SpacerMedium />
                                            <StyledRoundButton
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    incrementMintAmount();
                                                }}
                                            >
                                                +
                                            </StyledRoundButton>
                                            <s.SpacerSmall />

                                            <StyledButton
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    claimNFTs();
                                                    getData();
                                                }}
                                            >
                                                {claimingNft ? "BUSY" : "BUY"}
                                            </StyledButton>
                                        </s.Container>











                                        {/*//////      set cost    ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <StyledRoundButton
                                                style={{ lineHeight: 0.4 }}
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    decrementCostAmount();
                                                }}
                                            >
                                                -
                                            </StyledRoundButton>
                                            <s.SpacerMedium />
                                            <s.TextDescription
                                                style={{
                                                    textAlign: "center",
                                                    color: "var(--accent-text)",
                                                }}
                                            >
                                                {newCost}
                                            </s.TextDescription>
                                            <s.SpacerMedium />
                                            <StyledRoundButton
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    incrementCostAmount();
                                                }}
                                            >
                                                +
                                            </StyledRoundButton>
                                            <s.SpacerSmall />
                                            <StyledButton
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setNewCost();
                                                    getData();
                                                }}
                                            >
                                                {claimingNft ? "BUSY" : "set Cost"}

                                            </StyledButton>
                                        </s.Container>





                                        {/*//////      Show cost    ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    showCost();
                                                    getData();
                                                }}>
                                                Show Cost
                                            </StyledButton>


                                        </s.Container>


                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>

                                            <s.TextDescription
                                                style={{ textAlign: "center", color: "var(--accent-text)", backgroundColor: "black", marginTop: "5px" }}
                                            >
                                                <h3 id="lastInfo"> </h3>
                                            </s.TextDescription>
                                        </s.Container>


                                        {/*//////      setMaximum mint per trx   ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input 
                                                type="number"
                                                id="maxMintPertrx"
                                                placeholder="max amount to mint"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    maxMintPertrx()
                                                    getData();
                                                }}>
                                                Set max Mint/trx
                                            </StyledButton>
                                                </s.Container>

                                                {/*//////      setMaximum nft per wallet   ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input
                                                type="number"
                                                        id="setMaxMintperWallet"
                                                placeholder="max amount to mint"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                            setMaxMintperWallet()
                                                    getData();
                                                }}>
                                                Set max NFT/ wallet
                                            </StyledButton>
                                        </s.Container>



                                        {/*//////      whitelist sale    ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setWhitelistOn();
                                                    getData();
                                                }} >
                                                Open Whitelist Sale
                                            </StyledButton>


                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setWhitelistOff();
                                                    getData();
                                                }}>
                                                Start Public sale
                                            </StyledButton>

                                        </s.Container>



                                        {/*//////      pause/unpause sale   ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPausedTrue();
                                                    getData();
                                                }}>
                                                Pause Minting
                                            </StyledButton>


                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPausedFalse();
                                                    getData();
                                                }}>
                                                Unpause Minting
                                            </StyledButton>

                                        </s.Container>


                                        {/*//////      add unlimited mint address    ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input
                                                type="text"
                                                id="unlimitedMint"

                                                placeholder="Enter address for unlimited mint"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    unlimitedMintAddress();
                                                    getData();
                                                }}>

                                                Unlimited mint address
                                            </StyledButton>
                                                </s.Container>




                                        {/*//////      remove UnlimitedMintAddress    ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input
                                                type="text"
                                                id="removedunlimitedMint"

                                                placeholder="address to remove from unlimited mint"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    removeunlimitedMintAddress();
                                                    getData();
                                                }}>

                                                remove Unlimited mint address
                                            </StyledButton>
                                        </s.Container>



                                        {/*//////      add whitelist MintAddress    ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input
                                                type="text"
                                                id="addWhitelistaddress"
                                                placeholder="enter wl address"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addWhitelistaddress();
                                                    getData();
                                                }}>

                                                Add Wl address
                                            </StyledButton>
                                        </s.Container>
                                        {/*//////      remove whitelist MintAddress    ////////////*/}

                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input
                                                type="text"
                                                id="removeWhitelistaddress"
                                                placeholder="enter wl address"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    removeWhitelistaddress();
                                                    getData();
                                                }}>

                                                remove Wl address
                                            </StyledButton>
                                        </s.Container>


                                        {/*//////      giveaway 1 Nft   ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input
                                                type="text"
                                                id="giveawayNft"

                                                placeholder="giveaway address"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    giveawayNft()
                                                    getData();
                                                }}>
                                                Giveaway Nft
                                            </StyledButton>
                                        </s.Container>

                                        {/*//////      setBaseURI   ////////////*/}
                                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                                            <input
                                                type="text"
                                                id="setBaseURI"
                                                placeholder="ipfs://****"

                                            />
                                            <StyledButton
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    setBaseURI()
                                                    getData();
                                                }}>
                                                Set IPFS metadata
                                            </StyledButton>
                                        </s.Container>


                                        {/*//////      Reveal Nft    ////////////*/}

                                        <s.Container ai={"center"} jc={"center"} fd={"row"} >
                                            <StyledButton
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    revealNfts();
                                                    getData();
                                                }}
                                            >
                                                {claimingNft ? "BUSY" : "Reveal"}
                                            </StyledButton>
                                            <StyledButton
                                                disabled={claimingNft ? 1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    withdraw();
                                                    getData();
                                                }}
                                            >
                                                {claimingNft ? "BUSY" : "Withdraw"}
                                            </StyledButton>
                                        </s.Container>



                                    </>
                                )}
                            </>
                        )}
                        <s.SpacerMedium />
                    </s.Container>
                    <s.SpacerLarge />

                </ResponsiveWrapper>
                <s.SpacerMedium />
                <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
                    <s.TextDescription
                        style={{
                            textAlign: "center",
                            color: "white",
                        }}
                    >
                        Please make sure you are connected to the right network (
                        {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
                        Once you make the purchase, you cannot undo this action.
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <s.TextDescription
                        style={{
                            textAlign: "center",
                            color: "white",
                        }}
                    >
                        We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
                        successfully mint your NFT. We recommend that you don't lower the
                        gas limit.
                    </s.TextDescription>
                </s.Container>
            </s.Container>
        </s.Screen>
    );
}

export default App;
