import React, {useRef} from "react";
import mermaid from "mermaid";

// mermaid.initialize({
//   startOnLoad: true,
//   theme: "default",
//   fontFamily: "Fira Code"
// });

export class MermaidBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scaleRate: 70,
      showMermaidText: false
    }
    this.handleChangeScale = this.handleChangeScale.bind(this);
    this.handleChangeShow = this.handleChangeShow.bind(this);
  }

  handleChangeScale(event) {
    const newValue = event.target.value
    if (0 <= newValue && newValue <= 200) {
      this.setState({
        scaleRate: newValue,
        showMermaidText: this.state.showMermaidText
      })
    }
  }

  handleChangeShow(event) {
    console.log('show', event.target, event.target.value, event.target.checked)
    this.setState({
      scaleRate: this.state.scaleRate,
      showMermaidText: event.target.checked
    })
  }

  render() {
    console.log(this.props.chart)
    const textDiv = (
      this.state.showMermaidText
        ? <div style={{border: "1px solid #888", padding: "5px", margin: "5px", "white-space": "pre-wrap"}}>{this.props.chart}</div>
        : null
    )

    return (
      <div style={{border: "1px solid #888", padding: "10px", margin: "10px"}}>
        <div>
          flowchart scale: <input type="number" step="10" style={{"width":"40px"}} value={this.state.scaleRate} onChange={this.handleChangeScale}/>%
          <span style={{"margin-left": "20px"}}>
            <input type="checkbox" checked={this.state.showMermaidText} onChange={this.handleChangeShow}/>show text
          </span>
        </div>
        <Mermaid chart={this.props.chart} scaleRate={this.state.scaleRate}/>
        {textDiv}
      </div>
    );
  }
}

function Mermaid({chart, scaleRate}) {
  const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
  const randomRef = useRef('random'+ randomid())

  const rawSvg = mermaid.render(randomRef.current, chart)
  const changedSvg = changeSize(rawSvg)

  // smaller a little bit
  function changeSize(svg1) {
    var wrapper= document.createElement('div');
    wrapper.innerHTML = svg1;
    const tmpHeight = wrapper.firstChild.getAttribute('height')
    wrapper.firstChild.setAttribute('height', tmpHeight * scaleRate / 100)
    return wrapper.innerHTML
  }

  return (
    <div style={{width: "max-content"}}>
      <div dangerouslySetInnerHTML={{__html: changedSvg}}/>
    </div>
  );
}