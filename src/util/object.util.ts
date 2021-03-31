export class ObjectUtil {

    public static isJSON(input): boolean {
        try {
            JSON.parse(input);
            return true;
        } catch (e) {
            return false;
        }
    }
}
