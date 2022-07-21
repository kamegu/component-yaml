import * as fs from 'fs'
import * as YAML from 'yaml'
import { Command } from 'commander';
const program = new Command();

import {parseRawYaml} from './ParsedYaml.js'
import {filterYaml} from "./filterYaml.js";
import {ReferenceSet} from "./ReferenceSet.js";
import {buildPuml} from './plantuml.js'
import {buildMermaid} from "./mermaid.js";

function run(): void {
  function commaSeparatedList(value, dummyPrevious) {
    return value.split(',').filter(w => w.length > 0);
  }

  program
    .option('--format <str>', 'output format','puml')
    .option('--output-dir <str>', 'output directory', 'output')
    .option('--output <str>', 'output file', 'components')
    .option('--target <str>', 'target elements(comma-separated)', commaSeparatedList, [])
    .option('--ignore <str>', 'ignored target(comma-separated)', commaSeparatedList, [])
    .option('--distance <num>', 'distance from target', '2')
    .option('--ignore-unknown', 'ignored unknown ref')

  program.parse()
  const options = program.opts();
  const format = options.format
  const extention = (format === "mermaid") ? ".md" : "." + format
  const outDir = options.outputDir
  const outputFile = options.output
  const outputFileName = outDir + (outDir.endsWith("/") ? "" : "/") + outputFile + (outputFile.endsWith(extention) ? "" : extention)

  const targets = options.target
  const distance = parseInt(options.distance, 10)
  const ignores = options.ignore
  const ignoreUnknown = options.ignoreUnknown

  const file = fs.readFileSync('./components.yaml', 'utf8')
  const raw = YAML.parse(file)

  console.log(raw.components)

  const parsed = parseRawYaml(raw)

  console.log({'targets': targets, 'distance': distance, 'ignore': ignores, 'ignoreUnknown': ignoreUnknown})
  const referenceSet = new ReferenceSet(parsed)
  const referable = referenceSet.referable(targets, distance, ignores, ignoreUnknown)
  console.log({'referable': referable})

  const filtered = filterYaml(parsed, referable)

  if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir)
  }
  if (format === "puml") {
    const uml = buildPuml(filtered)

    fs.writeFileSync(outputFileName, uml)
  } else if (format === "mermaid") {
    const uml = buildMermaid(filtered)

    fs.writeFileSync(outputFileName, uml)
  }

  console.log("output: " + outputFileName)
}

run()