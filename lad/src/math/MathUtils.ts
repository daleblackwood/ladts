/*
    LAD.Math is an object used to enclose useful mathematical methods.
*/
export namespace MathUtils {

    export function randomRange(min: number, max: number): number {
        return Math.random() * (max-min) + min;
    }

    export function scatter(number: number, percent: number): number {
        return number + (Math.random() - 0.5) * number * percent;
    }

    export function limit(value: number, low: number, high: number): number {
        if (value < low) return low;
        if (value > high) return high;
        return value;
    }

} 
