export const id = "EVENT_XL_SWITCH";
export const name = "XL Switch";
export const groups = ["EVENT_GROUP_CONTROL_FLOW","Cormorant42"];

export const autoLabel = (fetchArg) => {
  return `Switch ${fetchArg("variable")} with ${fetchArg("choices")} Options`;
};

// Copied from lib/events, modified to increase editor constraints
export const fields = [].concat(
  [
    {
      key: "variable",
      label: "Variable",
      type: "variable",
      defaultValue: "LAST_VARIABLE",
    },
    {
      key: "choices",
      label: "Number of options",
      type: "number",
      min: 1,
      max: 512,
      defaultValue: 2,
    },
  ],
  Array(512)
    .fill()
    .reduce((arr, _, i) => {
      arr.push({
        key: `__collapseCase${i}`,
        label: `When: $$value${i}$$`,
        conditions: [
          {
            key: "choices",
            gt: i,
          },
        ],
        type: "collapsable",
        defaultValue: false,
      });
      arr.push({
        key: `value${i}`,
        label: "Value",
        conditions: [
          {
            key: `__collapseCase${i}`,
            ne: true,
          },
          {
            key: "choices",
            gt: i,
          },
        ],
        type: "number",
        min: -32768,
        max: 32767,
        defaultValue: i + 1,
      });
      arr.push({
        key: `true${i}`,
        conditions: [
          {
            key: `__collapseCase${i}`,
            ne: true,
          },
          {
            key: "choices",
            gt: i,
          },
        ],
        type: "events",
      });
      return arr;
    }, []),
  [
    {
      key: "__collapseElse",
      label: "Else:",
      type: "collapsable",
      defaultValue: false,
      conditions: [
        {
          key: "__disableElse",
          ne: true,
        },
      ],
    },
    {
      key: "false",
      conditions: [
        {
          key: "__collapseElse",
          ne: true,
        },
        {
          key: "__disableElse",
          ne: true,
        },
      ],
      type: "events",
    },
  ]
);

export const compile = (input, helpers) => {
  const { caseVariableValue, _addComment } = helpers;
  const falsePath = input.__disableElse ? [] : input.false;

  _addComment("Large Switch");

  const choiceLookup = Array(input.choices)
    .fill()
    .reduce((memo, _, i) => {
      const value = input[`value${i}`];
      const key = Number.isInteger(parseInt(value, 10)) ? value : i + 1;
      if (!memo[key]) {
        return {
          ...memo,
          [key]: input[`true${i}`],
        };
      }
      return memo;
    }, {});

  caseVariableValue(input.variable, choiceLookup, falsePath);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: false,
};