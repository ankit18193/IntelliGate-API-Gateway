export class Serializer {
  public static stringify(data: any): string {
    return JSON.stringify(data, (key, value) => (value === undefined ? undefined : value));
  }

  public static parse<T>(json: string): T {
    try {
      return JSON.parse(json);
    } catch (error) {
      throw new Error(`Failed to parse response: ${error}`);
    }
  }
}
