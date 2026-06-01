const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const keyboardStates = ["", "black"];
const boxStates = ["yellow", "green"];

const keyboard = document.getElementById("keyboard");
let draggedTile = null;

function cycleState(element, states) {
  let index = Number(element.dataset.stateIndex);
  index = (index + 1) % states.length;

  element.dataset.stateIndex = index;

  element.classList.remove("black", "yellow", "green");

  if (states[index]) {
    element.classList.add(states[index]);
  }
}

rows.forEach(rowText => {
  const row = document.createElement("div");
  row.className = "row";

  rowText.split("").forEach(letter => {
    const button = document.createElement("button");

    button.className = "key";
    button.textContent = letter;
    button.dataset.key = letter;
    button.dataset.stateIndex = "0";
    button.draggable = true;

    button.addEventListener("click", () => {
      cycleState(button, keyboardStates);
    });

    button.addEventListener("dragstart", event => {
        draggedTile = null;
        event.dataTransfer.setData("text/plain", letter);
    });

    row.appendChild(button);
  });

  keyboard.appendChild(row);
});

const boxes = document.querySelectorAll(".letter-box");

boxes.forEach(box => {
  box.addEventListener("dragover", event => {
    event.preventDefault();
    box.classList.add("drag-over");
  });

  box.addEventListener("dragleave", () => {
    box.classList.remove("drag-over");
  });

  box.addEventListener("drop", event => {
    event.preventDefault();
  
    // If dragging an existing tile, move it instead of copying it
    if (draggedTile) {
      box.appendChild(draggedTile);
      draggedTile = null;
      box.classList.remove("drag-over");
      return;
    }
  
    // If dragging from keyboard, create a new tile
    const letter = event.dataTransfer.getData("text/plain");
  
    const tile = createBoxTile(letter);
    box.appendChild(tile);
  
    box.classList.remove("drag-over");
  });
});

function createBoxTile(letter) {
    const tile = document.createElement("button");
  
    tile.className = "column-letter yellow";
    tile.textContent = letter;
    tile.dataset.key = letter;
    tile.dataset.stateIndex = "0";
    tile.draggable = true;
  
    tile.addEventListener("dragstart", event => {
      draggedTile = tile;
      event.dataTransfer.setData("text/plain", letter);
    });
  
    tile.addEventListener("dragend", event => {
      const droppedSuccessfully =
        event.dataTransfer.dropEffect &&
        event.dataTransfer.dropEffect !== "none";
  
      if (!droppedSuccessfully && draggedTile === tile) {
        tile.remove();
      }
  
      draggedTile = null;
    });
  
    tile.addEventListener("click", event => {
      event.stopPropagation();
      cycleState(tile, boxStates);
    });
  
    return tile;
}

const solveButton = document.getElementById("solve-button");

solveButton.addEventListener("click", () => {
  solve();
});

async function solve() {
    const blackLetters = [];
    const greenLetters = [];
    const yellowLetters = {};
  
    document.querySelectorAll(".keyboard .key.black").forEach(key => {
      blackLetters.push(key.dataset.key.toLowerCase());
    });
  
    const boxes = document.querySelectorAll(".letter-box");
  
    boxes.forEach((box, columnIndex) => {
      box.querySelectorAll(".column-letter").forEach(tile => {
        const letter = tile.dataset.key.toLowerCase();
  
        if (tile.classList.contains("green")) {
          greenLetters.push({
            letter: letter,
            column: columnIndex
          });
        }
  
        if (tile.classList.contains("yellow")) {
          if (!yellowLetters[letter]) {
            yellowLetters[letter] = [];
          }
  
          yellowLetters[letter].push(columnIndex);
        }
      });
    });
  
    const response = await fetch("wordle_dictionary.txt");
    const text = await response.text();
  
    const words = text
      .split(/\r?\n/)
      .map(word => word.trim().toLowerCase())
  
    const matches = words.filter(word => {
      // Black letters: word cannot contain them
      for (const letter of blackLetters) {
        if (word.includes(letter)) {
          return false;
        }
      }
  
      // Green letters: letter must be in exact column
      for (const item of greenLetters) {
        if (word[item.column] !== item.letter) {
          return false;
        }
      }
  
      // Yellow letters: letter must exist, but not in listed columns
      for (const letter in yellowLetters) {
        if (!word.includes(letter)) {
          return false;
        }
  
        for (const badColumn of yellowLetters[letter]) {
          if (word[badColumn] === letter) {
            return false;
          }
        }
      }
  
      return true;
    });
  
    displayMatches(matches);
}

function displayMatches(matches) {
    const resultsBody = document.getElementById("results-body");
    resultsBody.innerHTML = "";
  
    if (matches.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
  
      cell.textContent = "No matches found";
      row.appendChild(cell);
      resultsBody.appendChild(row);
      return;
    }
  
    const wordsPerRow = 5;
  
    for (let i = 0; i < matches.length; i += wordsPerRow) {
      const row = document.createElement("tr");
  
      matches.slice(i, i + wordsPerRow).forEach(word => {
        const cell = document.createElement("td");
        cell.textContent = word;
        row.appendChild(cell);
      });
  
      resultsBody.appendChild(row);
    }
}