import { PreferenceTypeGroup } from "@/types/user";

type ConcatenatedPreference = {
  typeName: string;
  concatenated: string;
}

export class PreferenceParser {
  private readonly group: PreferenceTypeGroup[];

  constructor(group: PreferenceTypeGroup[]) {
    this.group = group;
  }

  parse(typeName: string): ConcatenatedPreference | null {
    console.log({ g: this.group });
    const group = this.group.find(g => g.typeName === typeName);
    console.log({ group });
    if (!group) {
      return null;
    }
  
    const concatenated = group.selectedOptions.map(opt => opt.displayName).join(', ');
  
    return {
      typeName,
      concatenated,
    };
  }

}
