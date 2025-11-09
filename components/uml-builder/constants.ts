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
    description: "Use when a class extends another class (is-a relationship)",
  },
  {
    name: "Composition",
    symbol: "◆──",
    type: "composition",
    description:
      "Use when a class contains another class (has-a strong relationship)",
  },
  {
    name: "Association",
    symbol: "───>",
    type: "association",
    description: "Use for general relationships between classes",
  },
  {
    name: "Dependency",
    symbol: "┄┄>",
    type: "dependency",
    description: "Use when one class depends on another but doesn't own it",
  },
];

export const EDGE_STYLES = [
  { name: "Smooth", type: "smoothstep" },
  { name: "Straight", type: "straight" },
  { name: "Bezier", type: "default" },
  { name: "Step", type: "step" },
];

export const VISIBILITY_SYMBOLS = {
  private: "- (private)",
  public: "+ (public)",
  protected: "# (protected)",
};

export const ATTRIBUTE_EXAMPLES = [
  "- name: String",
  "- count: int",
  "- items: List<Item>",
  "- observerList: Observer*",
  "- state: State*",
  "+ publicField: double",
];

export const METHOD_EXAMPLES = [
  "+ update()",
  "+ notify()",
  "+ getState(): State*",
  "+ setState(state: State)",
  "- privateMethod(): void",
  "# protectedMethod(param: String): boolean",
];
