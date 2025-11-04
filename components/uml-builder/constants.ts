export const CORRECT_PATTERN = {
  classes: {
    Subject: {
      attributes: ["- observerList: Observer*"],
      methods: ["+ attach(Observer)", "+ detach(Observer)", "+ notify()"],
      type: "abstract",
    },
    Observer: {
      attributes: [],
      methods: ["+ update()"],
      type: "interface",
    },
    ConcreteSubject: {
      attributes: ["- subjectState: State*"],
      methods: ["+ getState(): State*", "+ setState()"],
      type: "concrete",
    },
    ConcreteObserver: {
      attributes: ["- observerState: State*", "- subject: ConcreteSubject*"],
      methods: ["+ update()"],
      type: "concrete",
    },
  },
  relationships: [
    { from: "ConcreteSubject", to: "Subject", type: "inheritance" },
    { from: "ConcreteObserver", to: "Observer", type: "inheritance" },
    { from: "Subject", to: "Observer", type: "composition" },
    { from: "ConcreteObserver", to: "ConcreteSubject", type: "association" },
  ],
};

export const CLASS_OPTIONS = [
  { name: "Subject", type: "abstract" },
  { name: "Observer", type: "interface" },
  { name: "ConcreteSubject", type: "concrete" },
  { name: "ConcreteObserver", type: "concrete" },
];

export const RELATIONSHIP_TYPES = [
  {
    name: "Inheritance",
    symbol: "◁──",
    type: "inheritance",
    description: "When a class extends another",
  },
  {
    name: "Composition",
    symbol: "◆──",
    type: "composition",
    description: "When a class contains another",
  },
  {
    name: "Association",
    symbol: "───>",
    type: "association",
    description: "General relationship",
  },
  {
    name: "Dependency",
    symbol: "┄ ┄ ┄>",
    type: "dependency",
    description: "Depends on but doesn't own",
  },
];

export const EDGE_STYLES = [
  { name: "Smooth", type: "smoothstep" },
  { name: "Straight", type: "straight" },
  { name: "Bezier", type: "default" },
  { name: "Step", type: "step" },
];

export const ATTRIBUTE_EXAMPLES = [
  "name: String",
  "count: int",
  "observerList: Observer*",
  "state: State*",
];

export const METHOD_EXAMPLES = [
  "update()",
  "notify()",
  "getState(): State*",
  "setState(state: State)",
];

export const CLASS_HELP = {
  Subject:
    "Acts as the central hub that tracks all observers and triggers their updates when state changes.",
  Observer: "Provides the contract that all concrete observers must follow.",
  ConcreteSubject:
    "Holds the real data and triggers observer notifications when that data changes.",
  ConcreteObserver:
    "Listens to the subject and updates itself whenever the subject changes.",
};
