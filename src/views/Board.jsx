import React, { useState, useEffect  } from "react";
import axios from "axios";

const Board = () => {
  const site = "http://localhost:5265/";
  const emptyBoard = Array(9).fill(null);
  const [listBoardGame, setListBoardGame] = useState([]);
  const [boardStatistics, setBoardStatistics] = useState({ 
    xWinPercent : 0, 
    oWinPercent : 0, 
    quitPercent : 0, 
    drawPercent : 0, 
  });
  const [timeDuration, setTimeDuration] = useState(0);
  const [timeInterval, setTimeInterval] = useState(null);
  const [isGameStating, setIsGameStating] = useState(false);  
  const [isEndGame, setIsEndGame] = useState(false);  
  const [isStartUp, setIsStartUp] = useState(false);  
  const [txtStatus, setTxtStatus] = useState('');
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState("X");

  const onNewGameClicked = async () => {  
    const gameId = await onBoardNewGame();
    setBoard(emptyBoard)
    setIsEndGame(false)
    setTxtStatus('')
    setGameId((_) => gameId);
    setIsGameStating((_) => true);  
    setCurrentPlayer((_) => "X");
    const temp = setInterval(() => {    
      setTimeDuration((_) => _ + 1);
    }, 1000);
    setTimeInterval(temp);
  };

  const onQuitGameClicked = async () => {
    await onBoardQuitGame(gameId); 
    setBoard(emptyBoard)
    setIsEndGame(true)
    await clearAndUpdate();
  };

  const onTimeoutClicked = async () => {
    await onBoardTimeout(gameId); 
    setIsEndGame(true)
    await clearAndUpdate();
  };

  const clearAndUpdate = async () => {
      if(timeInterval != null) {
        clearInterval(timeInterval);
      }
     setTimeInterval(null);
     setTimeDuration(0);
     setIsGameStating(false);
     setGameId(null);
     setCurrentPlayer("X");
     await getBoardGame();
     await getBoardStatistics();
   };

  const onCellClicked = async (index) => {
    if (!isGameStating) {
      return;
    }
    const newBoard = board.slice();
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    const res = await onBoardCheckWinner(newBoard);
    if (res && res.isEndGame) {
      if(res.isDraw) {
        setTxtStatus(res.status)
      } else {
        setTxtStatus(`Winner : ${res.nameWinner}`);
      }
      setIsEndGame(res.isEndGame)
      setIsGameStating(false);
      await clearAndUpdate()
    }
  };

  const onBoardQuitGame = async (id) => {
    const res = await axios.put(`${site}${id}/QuitGame?timeDuration=${timeDuration}`);
    return res.data;
  };

  
  const onBoardTimeout = async (id) => {
    const res = await axios.put(`${site}${id}/Timeout?timeDuration=${timeDuration}`);
    return res.data;
  };

  const getBoardGame = async () => {
    const res = await axios.get(`${site}GetBoardGame`);
    setListBoardGame(res.data);
  };

  const getBoardStatistics = async () => {
    const res = await axios.get(`${site}GetBoardStatistics`);
    setBoardStatistics(res.data);
  };


  const onBoardNewGame = async () => {
    const res = await axios.post(`${site}NewGame`);
    return res.data;
  };

  const onBoardCheckWinner = async (val) => {
    const payload = { 
      score: val ,
      id: gameId ,
      timeDuration: timeDuration 
    };
    const res = await axios.post(`${site}CheckWinner`, payload);
    return res.data;
  };

  useEffect(() => {
    if(isStartUp == false) {
      setIsStartUp(true);
      getBoardGame();
      getBoardStatistics();
      console.log(isStartUp)
    }
    
    if (isStartUp && isGameStating) {
      console.log(timeDuration)
      if( timeDuration > 59) {
        setIsGameStating(false)
        onTimeoutClicked();
      }
    }
  });

  return (
    <>
      <div className="intro-y game-container">
        <div className="intro-y game-title">
          <h1 className=" text-gray-600">Tic Tac Toe</h1>
        </div>
        <div className="flex -mt-2 mb-5">
          <button
            disabled={isGameStating}
            onClick={() => onNewGameClicked()}
            className="btn btn-primary ml-2 shadow-md self-center"
          >
            New Game
          </button>
          <button
            disabled={!isGameStating}
            onClick={() => onQuitGameClicked()}
            className="btn btn-primary ml-2 shadow-md self-center "
          >
            Quit Game
          </button>
        </div>
        <div className="intro-y board">
          {board.map((cell, index) => (
            <div
              key={index}
              style={{
                cursor: isGameStating ? "pointer" : "no-drop",
                opacity: isGameStating ? "1" : "0.6",
              }}
              className={`cell ${cell}`}
              onClick={() => onCellClicked(index)}
            >
              {cell}
            </div>
          ))}
        </div>
        <div className="flex">
          { isGameStating  ?
            <div className="intro-y status text-gray-600 mr-5">
              Time Duration : {timeDuration}
            </div> 
            :''}
        
          <div className="intro-y status text-gray-600">
            {isEndGame
              ? txtStatus
              : `Current player: ${currentPlayer}`}
          </div>
        </div>
        <div className="mt-10">
          <div className="text-center">
            <label className="text-gray-600"> Passed Games</label>
          </div>
          <div className="intro-x inbox box mt-2">
            <div className="TableH p-5 flex flex-col-reverse sm:flex-row text-gray-600 border-b border-gray-200 dark:border-dark-1">
              <div className="flex items-center mt-3 sm:mt-0 border-t sm:border-0 border-gray-200 pt-5 sm:pt-0 -mx-5 sm:mx-0 px-5 sm:px-0">
                <div className="w-48 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">Game Date</span>
                </div>
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">Game Id</span>
                </div>
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">Game Status</span>
                </div>
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">
                    Game Duration (s)
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto sm:overflow-x-visible">
              <div className="intro-y">
                {listBoardGame.length < 1 ? (
                  <div className="inbox__item inline-block sm:block text-gray-700 dark:text-gray-500 bg-gray-100 dark:bg-dark-1 border-b border-gray-200 dark:border-dark-1">
                    <div className="px-5 py-3 text-center">
                      <span className="inbox__item--highlight">No Result</span>
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {listBoardGame.map((item, index) => (
                  <div
                    key={index}
                    className="inbox__item inline-block sm:block text-gray-700 dark:text-gray-500 bg-gray-100 dark:bg-dark-1 border-b border-gray-200 dark:border-dark-1"
                  >
                    <div className="flex px-5 py-3">
                      <div className="w-48 flex-none flex justify-center items-center mr-5">
                        <span className="inbox__item--highlight">
                          {String(item.dateTime)}
                        </span>
                      </div>
                      <div className="w-36 flex-none flex justify-center items-center mr-5">
                        <span className="inbox__item--highlight">
                          {String(item.id)}
                        </span>
                      </div>
                      <div className="w-36 flex-none flex justify-center items-center mr-5">
                        <span className="inbox__item--highlight">
                          {item.status}
                        </span>
                      </div>
                      <div className="w-36 flex-none flex justify-center items-center mr-5">
                        <span className="inbox__item--highlight">
                          {String(item.timeDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <div className="text-center">
            <label className="text-gray-600"> Statistics</label>
          </div>
          <div className="intro-x inbox box mt-2">
            <div className="TableH p-5 flex flex-col-reverse sm:flex-row text-gray-600 border-b border-gray-200 dark:border-dark-1">
              <div className="flex items-center mt-3 sm:mt-0 border-t sm:border-0 border-gray-200 pt-5 sm:pt-0 -mx-5 sm:mx-0 px-5 sm:px-0">
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">
                    X - Win Percent
                  </span>
                </div>
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">
                    O - Win Percent
                  </span>
                </div>
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">Quit Percent</span>
                </div>
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">Draw Percent</span>
                </div>
                <div className="w-36 flex-none flex justify-center items-center mr-5">
                  <span className="inbox__item--highlight">Timeout Percent</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto sm:overflow-x-visible">
              <div className="intro-y">
                <div className="inbox__item inline-block sm:block text-gray-700 dark:text-gray-500 bg-gray-100 dark:bg-dark-1 border-b border-gray-200 dark:border-dark-1">
                  <div className="flex px-5 py-3">
                    <div className="w-36 flex-none flex justify-center items-center mr-5">
                      <span className="inbox__item--highlight">{boardStatistics.xWinPercent} %</span>
                    </div>
                    <div className="w-36 flex-none flex justify-center items-center mr-5">
                      <span className="inbox__item--highlight">{boardStatistics.oWinPercent} %</span>
                    </div>
                    <div className="w-36 flex-none flex justify-center items-center mr-5">
                      <span className="inbox__item--highlight">{boardStatistics.quitPercent} %</span>
                    </div>
                    <div className="w-36 flex-none flex justify-center items-center mr-5">
                      <span className="inbox__item--highlight">{boardStatistics.drawPercent} %</span>
                    </div>
                    <div className="w-36 flex-none flex justify-center items-center mr-5">
                      <span className="inbox__item--highlight">{boardStatistics.timeoutPercent} %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Board;
