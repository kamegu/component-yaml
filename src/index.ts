import * as fs from 'fs'
import * as YAML from 'yaml'
import { Command } from 'commander';
const program = new Command();

import {ParsedYaml, ComponentYaml} from './ParsedYaml'
import {buildPuml} from './plantuml'
import {buildMermaid} from "./mermaid";

function parseRawYaml(rawYaml: any): ParsedYaml {
  const components = new Map<string, ComponentYaml>();

  if (rawYaml.components instanceof Object) {
    for (const key of Object.keys(rawYaml.components)) {
      components.set(key, rawYaml.components[key])
    }
  }
  return {
    components: components
  }
}


function run(): void {
  program
    .option('--format <str>', 'output format','puml')
    .option('--output-dir <str>', 'output directory', 'output')
    .option('--output <str>', 'output file', 'components')

  program.parse()
  const options = program.opts();
  const format = options.format
  const extention = (format === "mermaid") ? ".md" : "." + format
  const outDir = options.outputDir
  const outputFile = options.output
  const outputFileName = outDir + (outDir.endsWith("/") ? "" : "/") + outputFile + (outputFile.endsWith(extention) ? "" : extention)

  const file = fs.readFileSync('./components.yaml', 'utf8')
  const raw = YAML.parse(file)

  console.log(raw.components)

  const parsed = parseRawYaml(raw)

  if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir)
  }
  if (format === "puml") {
    const uml = buildPuml(parsed)

    fs.writeFileSync(outputFileName, uml)
  } else if (format === "mermaid") {
    const uml = buildMermaid(parsed)

    fs.writeFileSync(outputFileName, uml)
  }

  console.log("output: " + outputFileName)
}

run()