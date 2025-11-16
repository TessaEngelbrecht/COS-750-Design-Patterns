export interface UMLNodeData extends Record<string, unknown> {
  label: string;
  attributes: string[];
  methods: string[];
  classType: string;
  className: string;
  handleNodeSelect: (className: string) => void;
}

export interface UMLEdgeData extends Record<string, unknown> {
  relationType: string;
  sourceClass: string;
  targetClass: string;
  edgeStyle?: string;
}
