> ⚠️ **Warning**: README is currently outdated - instead of **senteces.txt** is used config.yaml file. Check **config.example.yaml**

# Simple Regex patterns to DialogFlow sentences generator

This tools helps to generate training phrases for [Google DialogFlow](https://dialogflow.com/) and output JSON file which can be imported into DialogFlow supporting also **parsing entities**.

It takes all sentences in file *sentences.txt* with optional entities and generate all possible combinations based on simple regular expression matching.

## Installation and usage
Install all Node dependencies, and run command `convert` with example sentences file. If file name is omitted, *sentences.txt* is used. Syntax and possibilities are explained below.

```bash
npm install
npm run convert sentences.example.txt
```

This will output all generated sentences into console but also create *dialogFlowOutput.json* file which can be imported into DialogFlow console. If importing into single Intent, download file first and output from file put under `userSays` key in root Object. You can check *dialogFlowOutput.example.json* file .

## Syntax of file
File supports comments, entity definitions and sentences. Each line starting with `#` symbol is treated as comment and is ignored, empty lines are ignored as well.

Every sentence should be on single line and can contain very basic subset of regular expression. Into sentence can be placed multiple entities which are then parsed in DialogFlow JSON file.

### Regular expression possibilities
- `Count (one|two)` - will generate two sentences with each number
- `Count (one|two)?` - will generate three sentences with each number and one without
- `Count from (one|two) to (nine|ten)` - will generate 4 sentences with pairs `one-nine`, `one-ten`, `two-nine`, `two-ten`
- Nesting `I'm (1st|2nd|3rd|(4|5|6)th)`**is not supported** - the inner (4|5|6) will not work properly

**Example**
```
# This sentence will result in 4 sentences
I( am|'m) Pavel( from Ostrava)?.
```

Output
```
I am Pavel.
I am Pavel from Ostrava.
I'm Pavel.
I'm Pavel from Ostrava.
```

### Entities matching and DialogFlow syntax
Main benefit of tool is to generate [entities](https://cloud.google.com/dialogflow/docs/entities-overview) in JSON. In the beginning of file entities must be defined with possible phrases, which can be defined again with regular expression as above. Entity is then replaced with one of phrases and marked in DialogFlow JSON.
Each entity is defined on single line and must be defined before first use in any sentence.

**Example**
```
# Defining entity @journey
# It contains 4 + 4 pairs. Semicolon split multiple regular expressions
@journey{(Ostrava|Prague) to (Paris|Berlin);(Bratislava|Vienna) to (Madrid|Helsinki)}

Flying from @journey every (day|week|first Monday in the month) in the (morning|evening)
```
Output: There are 6 sentences because original sentence generate 6 possibilities. Entities are then inserted randomly from all 8 journey possibilities.
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
```
@journeyEU{(Ostrava|Prague) to (Paris|Berlin);(Bratislava|Vienna) to (Madrid|Helsinki)}
@journeyWorld{(Amsterdam|Oslo) to (New York|Washington)}

# Check escaped `?` to prevent attaching it into regular expression
Flying from (@journeyEU|@journeyWorld) every (day|week|first Monday in the month)\?
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