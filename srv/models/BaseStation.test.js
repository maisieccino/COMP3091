const BaseStation = require("./BaseStation");
const { ValidationError } = require("objection");
const testId = "00000000-0000-0000-0000-000000000000";

describe("create new base station", () => {
  test("creates a new base station without any parameters", () => {
    const baseStation = BaseStation.fromJson({});
    expect(baseStation).toBeInstanceOf(BaseStation);
  });

  test("can't set id manually", () => {
    const baseStation = BaseStation.fromJson({
      id: testId,
    });
    expect(baseStation.id).not.toBe(testId);
  });

  test("can set a name and coordinates", () => {
    const baseStation = BaseStation.fromJson({
      name: "Test Station",
      lat: 10.5,
      lng: -10.5,
    });
    expect(baseStation.name).toBe("Test Station");
    expect(baseStation.lat).toEqual(10.5);
    expect(baseStation.lng).toEqual(-10.5);
    expect(typeof baseStation.lat).toBe("number");
    expect(typeof baseStation.lng).toBe("number");
  });

  test("can't set a string for a coordinate", () => {
    expect(() => {
      BaseStation.fromJson({
        lat: "hello",
      });
    }).toThrowError(ValidationError);
  });
});
