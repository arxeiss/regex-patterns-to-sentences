# Simple Regex patterns to DialogFlow sentences generator

This tool helps to generate training phrases for [Google DialogFlow](https://dialogflow.com/) and output JSON file which can be imported. Also supports **parsing entities** to highlight entities in all sentences after import into DialogFlow.

It takes all sentences in file *config.yaml* with optional entities and generate all possible combinations based on simple regular expression matching.

## Installation and usage
Install all Node dependencies, and run command `convert` with example sentences file. If file name is omitted, *config.yaml* is used. Syntax and possibilities are explained below.

```bash
npm install
cp config.example.yaml config.yaml
npm run convert
```

This will output all generated sentences into console but also create *dialogFlowOutput.json* file which can be imported into DialogFlow console. If you are importing single Intent, put content of currently generated JSON file under key `userSays` of original exported intent. You can check *dialogFlowOutput.example.json* file .

## Syntax of file
Config supports variables, entity definitions and sentences. Random section in config file can control random number generator. Then output can be repeatable with same phrases. More about PRNG below. Check also **config.example.json** first.

### Regular expression possibilities
- `Count (one|two)` - will generate two sentences with each number
- `Count (one|two)?` - will generate three sentences with each number and one without any.
- `Count from (one|two) to (nine|ten)` - will generate 4 sentences with pairs `one-nine`, `one-ten`, `two-nine`, `two-ten`
- Nesting `I'm (1st|2nd|3rd|(4|5|6)th)`**is not supported** - the inner (4|5|6) will not work properly

**Sentence example**
```yaml
sentences:
# This sentence will result in 4 sentences
- "I( am|'m) Pavel( from Ostrava)?."
```

Output
```
I am Pavel.
I am Pavel from Ostrava.
I'm Pavel.
I'm Pavel from Ostrava.
```

### Entities matching and DialogFlow syntax
Main benefit of tool is to generate [entities](https://cloud.google.com/dialogflow/docs/entities-overview) in JSON. Entities can be defined under `entities` key and those are saved globally. If entities are defined in `sentences` section, those are also saved into the global scope, but affects only sentences under this definition.

Last possible option is to define entities inside sentence which affects only one given sentence. Multiple phrases can be divided by semicolon `;`.

**Example**
```yaml
entities:
  "@journeyEU":
    alias: "journey"
    meta: "@journey"
    phrases:
      - "(Ostrava|Prague) to (Paris|Berlin)"
      - "(Bratislava|Vienna) to (Madrid|Helsinki)"

sentences:
- "Flying from @journeyEU every (day|week|first Monday in the month) in the (morning|evening)"
```
Output: There are 6 sentences because original sentence generate 6 possibilities. Entities are then inserted randomly from all 8 journey possibilities.
Alias and meta is there because of DialogFlow JSON below. It overrides default `@journeyEU` into `@journey`.
```
Flying from Bratislava to Madrid every day in the morning
Flying from Bratislava to Helsinki every day in the evening
Flying from Prague to Berlin every week in the morning
Flying from Prague to Paris every week in the evening
Flying from Vienna to Helsinki every first Monday in the month in the morning
Flying from Ostrava to Paris every first Monday in the month in the evening
```

#### Output in DialogFlow JSON
```json
[
    {
        "id": "c75170d6-cb0e-451c-b8cf-1987f0904c24",
        "data": [
            {
                "text": "Flying from ",
                "userDefined": false
            },
            {
                "text": "Ostrava to Paris",
                "alias": "journey",
                "meta": "@journey",
                "userDefined": false
            },
            {
                "text": " every day in the morning",
                "userDefined": false
            }
        ],
        "isTemplate": false,
        "count": 0,
        "updated": 0
    },
    ...
]
```

### Entities inside regular expressions and escaped '?'
Entities can be inserted into sentence inside regular expression as well.
```yaml
entities:
  "@journeyEU":
    alias: "journey"
    meta: "@journey"
    phrases:
      - "(Ostrava|Prague) to (Paris|Berlin)"
      - "(Bratislava|Vienna) to (Madrid|Helsinki)"

  "@journeyWorld":
    phrases:
      - "(Amsterdam|Oslo) to (New York|Washington)"

sentences:
# Check escaped `?` to prevent attaching it into regular expression
- Flying from (@journeyEU|@journeyWorld) every (day|week|first Monday in the month)\?
```

Output:
```
Flying from Prague to Paris every day?
Flying from Vienna to Madrid every week?
Flying from Prague to Berlin every first Monday in the month?
Flying from Amsterdam to New York every day?
Flying from Amsterdam to Washington every week?
Flying from Oslo to Washington every first Monday in the month?
```

### Variables

You can use variables in config file too. Variables are defined as *name-value* pair and name should consist of letters, numbers and underscore. Variable can be placed in alias, meta and phrases in `entities` and in all sentences by wrapping variable name by `{{` and `}}`. Whitespace between brackets and variable name is optional and is ignored. However putting 1 space around name is good practice for readability.

```yaml
vars:
  euCities: "Ostrava|Prague"
  entityAlias: "journey"
  date_part1: "(day|week|first Monday in the month)"

entities:
  "@journeyEU":
    alias: "{{ entityAlias }}"
    meta: "@{{ entityAlias }}"
    phrases:
      - "({{euCities}}) to (Paris|Berlin)"
      - "(Bratislava|Vienna) to (Madrid|Helsinki)"

sentences:
- "Flying from @journeyEU every {{ date_part1 }} in the (morning|evening)"
```

### Random number generator and seed

While this utility generate always all combinations of sentences, entities are placed randomly from all possible options. This can be sometimes annoying and problematic and for this reason you can set custom seed in config file. Then entities will be placed randomly but always with same order.

**Contextual seed** is another level of generator, which prevent changing randomly selected options when more sentences are added.
When contextual seed is `true`, for each sentence new PRNG is initialized with given *seed* combined with SHA-256 hash of that sentence. No matter if sentence is first or last in config file, sequence will be the same.

> **Note** If seed is set to null, contextualSeed value has no effect on generator.

**Example**

```yaml
random:
  seed: 'travelling'
  contextualSeed: false

sentences:
# If contextualSeed is false and we remove this sentence, the later will be affected too
- Flying from (@journeyEU|@journeyWorld) every (day|week|first Monday in the month)\.

# If contextual seed is true, before each next sentence new PRNG is generated
- "Are you flying from (@journeyEU|@journeyWorld) every (day|week|first Monday in the month)\\?"
```
