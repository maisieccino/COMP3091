const moment = require("moment");
const { ValidationError } = require("objection");
const uuid = require("uuid");
const { isUUID } = require("validator");
const Reading = require("./Reading");

describe("create a new reading object", () => {
  test("can create a new reading with only `t`", () => {
    const reading = Reading.fromJson({
      t: moment().toISOString(),
      counts: [],
    });

    expect(reading).toBeInstanceOf(Reading);
    expect(typeof reading.t).toBe("string");
  });

  test("fails if `counts` key missing", () => {
    expect(() => Reading.fromJson({ t: moment().toISOString() })).toThrowError(
      ValidationError,
    );
  });

  test("fails with badly formatted date", () => {
    expect(() => Reading.fromJson({ t: "hello" })).toThrowError(
      ValidationError,
    );
    expect(() => Reading.fromJson({ t: "Monday 1st January" })).toThrowError(
      ValidationError,
    );
  });

  test("fails if date does not exist", () => {
    expect(() => {
      const reading = Reading.fromJson({
        t: "2018-02-30T12:00:00",
      });
      console.log(reading.t);
    }).toThrowError(ValidationError);
  });

  test("succeeds if count objected populated with correctly formatted array", () => {
    const reading = Reading.fromJson({
      t: moment().toISOString(),
      counts: [{ species_id: 12, count: 1 }],
    });

    expect(reading).toBeInstanceOf(Reading);
  });

  test("fails if counts object provided as object", () => {
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: { species_id: 12, count: 1 },
      }),
    ).toThrowError(ValidationError);
  });

  test("fails if either species_id or count missing from count child elements", () => {
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ species_id: 12 }],
      }),
    ).toThrowError(ValidationError);

    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ count: 1 }],
      }),
    ).toThrowError(ValidationError);
  });

  test("fails if species_id not positive integer", () => {
    // non-numerical value
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ species_id: "hello", count: 1 }],
      }),
    ).toThrowError(ValidationError);

    // negative number
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ species_id: -1, count: 1 }],
      }),
    ).toThrowError(ValidationError);

    // non-integer real
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ species_id: 1.5, count: 1 }],
      }),
    ).toThrowError(ValidationError);
  });

  test("fails if count not positive integer", () => {
    // non-numerical value
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ count: "hello", species_id: 1 }],
      }),
    ).toThrowError(ValidationError);

    // negative number
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ count: -1, species_id: 1 }],
      }),
    ).toThrowError(ValidationError);

    // non-integer real
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ count: 1.5, species_id: 1 }],
      }),
    ).toThrowError(ValidationError);
  });

  test("validator strips out `counts` elements where count === 0", () => {
    const reading = Reading.fromJson({
      t: moment().toISOString(),
      counts: [{ species_id: 12, count: 0 }, { species_id: 11, count: 1 }],
    });

    expect(reading.counts).toHaveLength(1);
    expect(reading.counts[0].species_id).toBe(11);
  });

  test("each counts object has a unique species_id", () => {
    expect(() =>
      Reading.fromJson({
        t: moment().toISOString(),
        counts: [{ species_id: 12, count: 1 }, { species_id: 12, count: 2 }],
      }),
    ).toThrowError(ValidationError);
  });

  test("id gets set automatically", () => {
    const reading = Reading.fromJson({ t: moment().toISOString(), counts: [] });
    reading.$beforeInsert();
    expect(isUUID(reading.id)).toBeTruthy();
  });

  test("id can't be set by user", () => {
    const id = uuid.v4();
    const reading = Reading.fromJson({
      t: moment().toISOString(),
      counts: [],
      id,
    });
    reading.$beforeInsert();
    expect(reading.id).not.toBe(id);
  });
});
