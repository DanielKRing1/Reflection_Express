export const useFakeTimer = (startDate: Date) =>
    jest
        .useFakeTimers({
            doNotFake: [
                "nextTick",
                "setImmediate",
                "clearImmediate",
                "setInterval",
                "clearInterval",
                "setTimeout",
                "clearTimeout",
            ],
        })
        .setSystemTime(startDate);

export const advanceFakeTimer = (msToRun: number) =>
    jest.advanceTimersByTime(msToRun);

export const useRealTimer = () => jest.useRealTimers();
