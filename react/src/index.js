import React from 'react';
import ReactDOM from 'react-dom/client';
import YAML from 'yaml'
import './index.css'
import {ReferenceSet} from "cli/dist/ReferenceSet";

function parseRawYaml(rawYaml) {
  const components = new Map();

  if (rawYaml.components instanceof Object) {
    for (const key of Object.keys(rawYaml.components)) {
      components.set(key, rawYaml.components[key])
    }
  }
  return {
    components: components
  }
}

class ComponentList extends React.Component {
  render() {
    const components = [];
    if (this.props.components instanceof Object) {
      for (const key of Object.keys(this.props.components)) {
        components.push({name: key, component: this.props.components[key]})
      }
    }
    return (
      <table className="pure-table pure-table-bordered">
        <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Type</th>
        </tr>
        </thead>
        <tbody>
        {components.map((comp, idx) => {
          const cssClass = (comp.name === this.props.selected) ? "selected selectable" : "selectable"
          return <tr key={comp.name} onClick={() => this.props.onSelectComponent(comp.name)} className={cssClass}>
            <td>{idx}</td>
            <td>{comp.name}</td>
            <td>{comp.component.type}</td>
          </tr>
        })}
        </tbody>
      </table>
    )
  }
}

class SelectedComponent extends React.Component {
  render() {
    if (!this.props.name) {
      return <div>component unselected</div>
    }
    const componentName = this.props.name
    return (
      <div>
      <div>{componentName}</div>
      <table className="pure-table pure-table-bordered">
        <thead><th>Group</th><th>Name</th><th></th></thead>
        <ElementList key="--unknown-group" elements={this.props.component.elements} componentName={componentName} groupName=""></ElementList>
        {(this.props.component.groups || []).map((g) => {
          return <ElementList key={g.name} elements={g.elements} componentName={componentName} groupName={g.name}></ElementList>
        })}
      </table>
      </div>
    );
  }
}

class ElementList extends React.Component {

  render() {
    if (!this.props.elements) {
      return null
    }
    const prefix = `${this.props.componentName}--${this.props.groupName||''}--`
    return (
        <tbody>
        {this.props.elements.map((e, idx) => {
          const group = (idx !== 0) ? null : <td rowSpan={this.props.elements.length}>{this.props.groupName || "--"}</td>
          if (typeof e === 'string') {
            return <tr key={prefix+e}>{group}<td>{e}</td><td></td></tr>
          } else {
            const relations = <ul>
              {(e.input || []).map((r) => <li>{r.ref}</li>)}
              {(e.output || []).map((r) => <li>{r.ref}</li>)}
              {(e.use || []).map((r) => <li>{r.ref}</li>)}
            </ul>
            return <tr key={prefix+e.name}>{group}<td>{e.name}</td><td>{relations}</td></tr>
          }
        })}
        </tbody>
    );
  }
}

class ReferableComponents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      referenceSet: props.referenceSet,
      config: {
        distance: 2,
        ignores: [],
        ignoreUnknown: false
      }
    }
  }

  render() {
    const targets = this.props.target ? [this.props.target] : []
    const config = this.state.config
    const referable = this.state.referenceSet.referable(targets, config.distance, config.ignores, config.ignoreUnknown)
    console.log('referable', referable)

    return (
      <div>
        {referable.map((ref) => <span key={ref}>{ref}</span>)}
      </div>
    )
  }
}

class ComponentsRoot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      components: null,
      referenceSet: null,
      selected: null
    }
  }

  componentDidMount() {
    fetch("./components.yaml")
      .then(res => res.text())
      .then(
        (result) => {
          const raw = YAML.parse(result)
          const parsed = parseRawYaml(raw)
          const referenceSet = new ReferenceSet(parsed)
          console.log(raw)
          this.setState({
            isLoaded: true,
            components: raw.components,
            referenceSet,
            selected: null
          });
        },
        // 補足：コンポーネント内のバグによる例外を隠蔽しないためにも
        // catch()ブロックの代わりにここでエラーハンドリングすることが重要です
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  onSelectComponent(componentName) {
    const state = Object.assign(this.state, {
      selected: componentName
    })
    this.setState(state)
  }

  render() {
    const { isLoaded, components, selected } = this.state;
    console.log('render', this.state)

    if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      const selectedComp = this.state.components[selected] || null
      return (
        <div>
          <div>components</div>
          <ComponentList components={components} selected={selected} onSelectComponent={(n) => this.onSelectComponent(n)}></ComponentList>

          <SelectedComponent name={selected} component={selectedComp}></SelectedComponent>
          <ReferableComponents target={selected + "//"} referenceSet={this.state.referenceSet}></ReferableComponents>
        </div>
      );
    }
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ComponentsRoot />);
