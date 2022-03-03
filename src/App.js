import React from "react";

class WordleResults extends React.Component {
  constructor(props) {
    super(props);
    this.emoji_name = {
      "🟩": "green",
      "🟨": "yellow",
      "⬜": "white",
    };

    this.state = {
      disabled: false,
      results: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    // this.setState({ disabled: true });
  }

  enableEditing() {
    this.setState({ disabled: false });
  }

  parseWordleResults(results) {
    const regexp = /[🟩🟨⬜]/gu;
    let array = [...results.matchAll(regexp)];

    array = array.map((item) => item[0]);
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

  render() {
    const rm = {
      "⬜": "white",
      "🟨": "yellow",
      "🟩": "green",
    };

    return (
      <div>
        <button onClick={() => this.readClipboard()}>Paste Wordle</button>
        <div className="results">
          {this.state.results.map((line, l_num) => (
            <div key={"results-line-" + l_num} className="results-line">
              {line.map((emoji, e_num) => {
                console.log(this.props.emoji_values);
                return (
                  <Token
                    key={"token-" + l_num * 5 + e_num}
                    className={this.emoji_name[emoji]}
                    value={this.props.emoji_values[rm[emoji]]}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function Token(props) {
  return <span className={props.className}>{props.value}</span>;
}

class Replacement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      default: props.name,
      value: "",
    };

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
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.defaults = {
      white: "⬜",
      yellow: "🟨",
      green: "🟩",
    };

    this.popular_emojis = ["🤣", "👍", "😭", "🙏", "😘", "🥰", "😍", "😊"];

    this.defaults_inverted = {
      "⬜": "white",
      "🟨": "yellow",
      "🟩": "green",
    };

    this.state = {
      emoji_values: { ...this.defaults },
    };
  }

  updateReplacement(original, replacement) {
    console.log(original);
    console.log(replacement);
    let replacements = {
      ...this.state.emoji_values,
    };
    replacements[original] =
      replacement === "" ? this.defaults[original] : replacement;
    console.log(replacements);
    this.setState({ emoji_values: replacements });
  }

  random_emoji() {
    const emojis = getRandom(this.popular_emojis, 3);
    let replacements = {
      ...this.state.emoji_values,
    };
    for (const key in replacements) {
      replacements[key] = emojis.pop();
    }

    console.log("did something");
    this.setState({ emoji_values: replacements });
  }

  render() {
    const options = ["white", "yellow", "green"];
    return (
      <div>
        <WordleResults emoji_values={this.state.emoji_values} />
        <div>
          <ul>
            {options.map((option) => {
              return (
                <li key={option}>
                  {this.defaults[option]}{" "}
                  <Replacement
                    editCallback={(o, r) => this.updateReplacement(o, r)}
                    name={option}
                    // value={this.state.emoji_values[option]}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={() => this.random_emoji()}>Randomize</button>
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
