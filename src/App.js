import React from "react";
import "./App.css";

class WordleResults extends React.Component {
  constructor(props) {
    super(props);
    this.emoji_name = {
      "🟩": "green",
      "🟨": "yellow",
      "⬜": "white",
    };

    this.state = {
      textviewHidden: true,
      results: [],
      pastedContent: "",
    };

    this.textAreaRef = React.createRef();

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.parseWordleResults(event.target.value);
    this.setState({ pastedContent: "", textviewHidden: true });
  }

  parseWordleResults(results) {
    // The squares don't all render properly in my editor, but they
    // are, from left to right: green, yellow, white, grey.
    const regexp = /[🟩🟨⬜⬛]/gu;
    let array = [...results.matchAll(regexp)];

    // extract the actual emoji from the match object, and then transform
    // white squares (used in dark mode) to white squares.
    array = array.map((item) => {
      return item[0] === "⬛" ? "⬜" : item[0];
    });
    let lines = [];
    for (let i = 0; i < array.length; i += 5) {
      lines.push(array.slice(i, i + 5));
    }

    this.setState({ results: lines });
  }

  readClipboard() {
    navigator.clipboard
      .readText()
      .then((clipText) => this.parseWordleResults(clipText));
  }

  convertResults() {
    return this.state.results
      .map((line) => {
        let l = line.map((emoji) => {
          return this.props.replacements[this.emoji_name[emoji]];
        });

        return l.join("");
      })
      .join("\n");
  }

  copyToClipboard() {
    navigator.clipboard
      .writeText(this.convertResults())
      .then(() => alert("Copied results to clipboard"));
  }

  // The focus needs to be set after the component is rendered.
  openTextView() {
    this.setState({ textviewHidden: false });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.textAreaRef.current.focus();
  }

  render() {
    return (
      <div>
        <a href="#" onClick={() => this.openTextView()}>
          Paste as plain text instead. For people running that browser for
          furries.
        </a>
        <br />

        <button onClick={() => this.readClipboard()}>Paste Wordle</button>
        <button
          disabled={this.state.results.length === 0}
          onClick={() => this.copyToClipboard()}
        >
          Copy Results
        </button>

        <div className="textarea">
          <textarea
            hidden={this.state.textviewHidden}
            ref={this.textAreaRef}
            onChange={this.handleChange}
            value={this.state.pastedContent}
          />
        </div>

        <div className="results">{this.convertResults()}</div>
      </div>
    );
  }
}

// This is the editable text field for specifying a replacement.
// A value of nothing should translate into showing the defaults
// in the WordleResults component
class Replacement extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value }, () =>
      this.props.editCallback(this.props.name, this.state.value)
    );
  }

  render() {
    return (
      <input
        type="text"
        value={
          this.props.value === this.props.default_emoji ? "" : this.props.value
        }
        onChange={this.handleChange}
      />
    );
  }
}

class SavedCombinations extends React.Component {
  constructor(props) {
    super(props);

    // Grab the stringified list from local storage. Will be null if
    // it was never set.
    let savedCombos = localStorage.getItem("savedCombinations");
    if (savedCombos !== null) {
      savedCombos = JSON.parse(savedCombos);
    }

    this.state = {
      savedCombinations: savedCombos ?? [],
    };

    this.saveCombination = this.saveCombination.bind(this);
  }

  saveCombination() {
    let replacements = this.props.replacements();
    let savedCombos = this.state.savedCombinations.slice();
    savedCombos.push(replacements);
    this.setState({ savedCombinations: savedCombos });
    localStorage.setItem("savedCombinations", JSON.stringify(savedCombos));
  }

  deleteCombination(id) {
    console.log(id === 0 ? 1 : id);
    let savedCombos = this.state.savedCombinations.slice();
    let filtered = savedCombos.slice(0, id);
    console.log(filtered);
    console.log(savedCombos);

    console.log(savedCombos.slice(id + 1));
    filtered.push(...savedCombos.slice(id + 1));
    console.log(filtered);

    this.setState({ savedCombinations: filtered });
    localStorage.setItem("savedCombinations", JSON.stringify(filtered));
  }

  replacementToString(replacement) {
    return Object.entries(replacement)
      .map(([color, replacement_str]) => {
        return color + " = " + replacement_str;
      })
      .join(", ");
  }

  render() {
    return (
      <div className="saved-combinations">
        <button onClick={this.saveCombination}>Save Emoji Combination</button>

        <div className="combination-list">
          {this.state.savedCombinations.map((combo, num) => {
            let comboStr = this.replacementToString(combo);
            return (
              <div className="combo-container" key={comboStr}>
                <button onClick={() => this.props.setReplacement(combo)}>
                  {comboStr}
                </button>
                <button onClick={() => this.deleteCombination(num)}>
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    // The emojis may not all render properly in an editor, but they'll still work.
    this.defaults = {
      white: "⬜",
      yellow: "🟨",
      green: "🟩",
    };

    // used when selecting random emojis, will try to pick true random emojis later.
    this.popular_emojis = ["🤣", "👍", "😭", "🙏", "😘", "🥰", "😍", "😊"];

    this.state = {
      replacements: { ...this.defaults },
    };
  }

  // <Replacement> will call this when a replacement is typed
  updateReplacement(original, replacement) {
    let replacements = {
      ...this.state.replacements,
    };
    replacements[original] =
      replacement === "" ? this.defaults[original] : replacement;
    this.setState({ replacements: replacements });
  }

  random_emoji() {
    const emojis = getRandom(this.popular_emojis, 3);
    let replacements = {
      ...this.state.replacements,
    };
    for (const key in replacements) {
      replacements[key] = emojis.pop();
    }

    this.setState({ replacements: replacements });
  }

  get_replacements() {
    return this.state.replacements;
  }

  render() {
    return (
      <div>
        <WordleResults replacements={this.state.replacements} />
        <div>
          <ul>
            {Object.keys(this.defaults).map((color) => {
              return (
                <li key={color}>
                  {this.defaults[color]}{" "}
                  <Replacement
                    editCallback={(o, r) => this.updateReplacement(o, r)}
                    name={color}
                    default_emoji={this.defaults[color]}
                    replacement={this.state.replacements[color]}
                    value={this.state.replacements[color]}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={() => this.random_emoji()}>Randomize</button>
        <SavedCombinations
          replacements={() => this.get_replacements()}
          setReplacement={(replacement) =>
            this.setState({ replacements: replacement })
          }
        />
      </div>
    );
  }
}
export default App;

// https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
function getRandom(arr, n) {
  let result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    let x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

// TODO LIST
// Work with dark mode -- different emojis. DONE
//
// Alternative copy and paste method when clipboard API not supported. (Like in Firefox) DONE
//
// Get the randomizer to fill in the replacement fields. DONE!
//
// Let users save combinations.  DONE
//
// save the text preamble
