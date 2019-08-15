export class CombinationGenerator {
  static manyToMany(optionsTable: Array<Array<string>>): Array<Array<string>> {
    if (optionsTable.length === 0) {
      return [[]];
    }
    const combinations = new Array<Array<string>>();

    optionsTable[0].forEach(val => {
      combinations.push([val]);
    });

    for (let i = 1; i < optionsTable.length; i++) {
      const currentCombinations = combinations.splice(0);

      for (let c = 0; c < currentCombinations.length; c++) {
        const currentCombination = currentCombinations[c];

        for (let p = 0; p < optionsTable[i].length; p++) {
          const element = optionsTable[i][p];

          combinations.push([...currentCombination, element]);
        }
      }
    }

    return combinations;
  }
}