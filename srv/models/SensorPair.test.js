const SensorPair = require("./SensorPair");
const { ValidationError } = require("objection");
const { isUUID } = require("validator");
const uuid = require("uuid");

const baseObj = { motion_id: 1, camera_id: 1 };

describe("create a new sensor pair", () => {
  test("can't create a new sensor pair without any parameters", () => {
    expect(() => SensorPair.fromJson({})).toThrowError(ValidationError);
  });

  test("can create new sensor pair if camera_id and motion_id provided", () => {
    const pair = SensorPair.fromJson(baseObj);
    expect(pair).toBeInstanceOf(SensorPair);
  });

  test("camera_id must be a number", () => {
    expect(() =>
      SensorPair.fromJson({ camera_id: "hi", motion_id: 1 }),
    ).toThrowError(ValidationError);
  });

  test("motion_id must be a number", () => {
    expect(() =>
      SensorPair.fromJson({ motion_id: "hi", camera_id: 1 }),
    ).toThrowError(ValidationError);
  });

  test("can't set string for location coords", () => {
    expect(() =>
      SensorPair.fromJson({ ...baseObj, lat: "hi", lng: 10.5 }),
    ).toThrowError(ValidationError);

    expect(() =>
      SensorPair.fromJson({ ...baseObj, lat: 10.5, lng: "hi" }),
    ).toThrowError(ValidationError);
  });

  test("must set both lat and lng, or none", () => {
    expect(() => SensorPair.fromJson({ ...baseObj, lat: 10.5 })).toThrowError(
      ValidationError,
    );
    expect(() => SensorPair.fromJson({ ...baseObj, lng: 10.5 })).toThrowError(
      ValidationError,
    );
    expect(() =>
      SensorPair.fromJson({ ...baseObj, lat: 10.5, lng: 10.5 }),
    ).not.toThrowError(ValidationError);
  });

  test("expect id to be set on insert", async () => {
    const pair = SensorPair.fromJson(baseObj);
    await pair.$beforeInsert();
    expect(isUUID(pair.id)).toBeTruthy();
  });

  test("expect id to be overwritten on insert", async () => {
    const id = uuid.v4();
    const pair = SensorPair.fromJson({ ...baseObj, id });
    await pair.$beforeInsert();
    expect(pair.id).not.toBe(id);
  });
});
