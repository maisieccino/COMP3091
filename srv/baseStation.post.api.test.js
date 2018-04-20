const srv = require("./index");
const request = require("supertest").agent(srv.listen());
const uuid = require("uuid");
const { isUUID } = require("validator");

const tracker = require("mock-knex").getTracker();

tracker.install();

const defaultBaseStationObj = {
  name: "Test Station",
  lat: 10.5,
  lng: -10.5,
};

const defaultBaseStation = {
  ...defaultBaseStationObj,
  id: uuid.v4(),
};

tracker.on("query", (query, step) => {
  switch (step) {
    // create success
    case 1: {
      expect(query.method).toBe("insert");
      // expect `id` to be set and to be a uuid
      expect(query.bindings.id).not.toBeNull();
      expect(isUUID(query.bindings[1])).toBeTruthy();
      return query.response(defaultBaseStation);
    }
    default: {
      return query.response([]);
    }
  }
});

afterAll(() => {
  tracker.uninstall();
});

describe("POST /basestation/", () => {
  test("posting with no params creates a base station", async () => {
    expect.assertions(6);
    const res = await request
      .post("/basestation")
      .type("application/json")
      .accept("application/json")
      .send({});
    expect(res.status).toBe(201);
    expect(Object.keys(res.body.content).sort()).toEqual([
      "created_at",
      "id",
      "lat",
      "lng",
      "updated_at",
    ]);
    expect(res.body.error).toBeUndefined();
  });

  test("posting with incorrect params returns 400 error code", async () => {
    expect.assertions(2);
    const res = await request
      .post("/basestation")
      .type("application/json")
      .accept("application/json")
      .send({ lat: "10", lng: 10.5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("lat");
  });
});
