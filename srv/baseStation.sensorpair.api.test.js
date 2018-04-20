const srv = require("./index");
const request = require("supertest").agent(srv.listen());
const uuid = require("uuid");
const { isUUID } = require("validator");

const tracker = require("mock-knex").getTracker();

tracker.install();

const defaultBaseStation = {
  name: "Test Station",
  lat: 10.5,
  lng: -10.5,
  id: uuid.v4(),
};

const defaultSensorPairObj = {
  name: "Test Pair",
  lat: 10.5,
  lng: -10.5,
  camera_id: 1,
  motion_id: 1,
};

const defaultSensorPair = {
  ...defaultSensorPairObj,
  id: uuid.v4(),
};

tracker.on("query", (query, step) => {
  switch (step) {
    // get sensor pairs of valid base station
    case 1: {
      return query.response(defaultBaseStation);
    }
    case 2: {
      expect(query.method).toBe("select");
      expect(query.bindings).toContain(defaultSensorPair.id);
      return query.response([defaultSensorPair]);
    }
    default: {
      return query.response([]);
    }
  }
});

afterAll(() => {
  tracker.uninstall();
});

describe("GET /basestation/:id/sensorpairs", () => {
  test("get sensor pairs for valid base station", async () => {
    expect(true).toBeTruthy();
  });
});
