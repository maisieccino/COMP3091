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

const postSensorPair = data =>
  request
    .post(`/basestation/${defaultBaseStation.id}/sensorpairs`)
    .type("application/json")
    .accept("application/json")
    .send(data);

tracker.on("query", (query, step) => {
  switch (step) {
    // get sensor pairs of valid base station
    case 1: // 1: successful fetch
    case 3: // 3: successful (empty) fetch
    case 6: {
      // 6: successful create
      // 9: missing motion_id
      return query.response(defaultBaseStation);
    }
    case 2: {
      expect(query.method).toBe("select");
      expect(query.bindings).toContain(defaultBaseStation.id);
      return query.response([defaultSensorPair]);
    }
    // get empty list of sensor pairs
    case 4: {
      return query.response([]);
    }
    // 5: fetch base station -> not found
    // 8: create -> base station not found
    case 5:
    case 8: {
      return query.response([]);
    }
    // post new sensor pair
    case 7: {
      expect(query.method).toBe("insert");
      expect(query.bindings).toContain(defaultBaseStation.id);
      return query.response(defaultBaseStation);
    }
    // all other tests
    default: {
      return query.response(defaultBaseStation);
    }
  }
});

afterAll(() => {
  tracker.uninstall();
});

describe("GET /basestation/:id/sensorpairs", () => {
  test("get sensor pairs for valid base station", async () => {
    expect.assertions(4);
    const res = await request
      .get(`/basestation/${defaultBaseStation.id}/sensorpairs`)
      .accept("application/json");
    expect(res.status).toBe(200);
    expect(res.body.content).toBeInstanceOf(Array);
  });

  test("returns empty array if no sensor pairs", async () => {
    expect.assertions(3);
    const res = await request
      .get(`/basestation/${defaultBaseStation.id}/sensorpairs`)
      .accept("application/json");
    expect(res.status).toBe(200);
    expect(res.body.content).toBeInstanceOf(Array);
    expect(res.body.content).toHaveLength(0);
  });

  test("returns 404 not found if base station id doesn't exist", async () => {
    expect.assertions(2);
    const res = await request
      .get(`/basestation/${defaultBaseStation.id}/sensorpairs`)
      .accept("application/json");
    expect(res.status).toBe(404);
    expect(res.body.content).toBeUndefined();
  });
});

describe("POST /basestation/:id/sensorpairs", () => {
  test("creates sensor pair for base station with minimal data", async () => {
    expect.assertions(5);
    const res = await postSensorPair({ camera_id: 1, motion_id: 1 });
    expect(res.status).toBe(201);
    expect(typeof res.body.content).toBe("object");
    expect(isUUID(res.body.content.id)).toBeTruthy();
  });

  test("fails with 404 if no base station found", async () => {
    expect.assertions(2);
    const res = await postSensorPair({ camera_id: 1, motion_id: 1 });
    expect(res.status).toBe(404);
    expect(res.body.content).toBeUndefined();
  });

  test("fails if motion_id or camera_id not included in data", async () => {
    expect.assertions(6);
    let res = await postSensorPair({ motion_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.content).toBeUndefined();
    expect(res.body.error).toContain("camera_id");

    res = await postSensorPair({ camera_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.content).toBeUndefined();
    expect(res.body.error).toContain("motion_id");
  });

  test("fails if camera_id or motion_id are not positive integers", async () => {
    const tests = [
      { camera_id: "hello", motion_id: 1 },
      { camera_id: -1, motion_id: 1 },
      { camera_id: 3.5, motion_id: 1 },
      { motion_id: "hello", camera_id: 1 },
      { motion_id: -1, camera_id: 1 },
      { motion_id: 3.5, camera_id: 1 },
    ];
    expect.assertions(tests.length * 2);
    await Promise.all(
      tests.map(async test => {
        const res = await postSensorPair(test);
        expect(res.status).toBe(400);
        expect(res.body.content).toBeUndefined();
      }),
    );
  });

  test("fails if lat or lng are not numbers", async () => {
    const baseObj = { camera_id: 1, motion_id: 1 };
    const tests = [
      { lat: "hello", lng: "hi" },
      { lat: 10.5, lng: "hi" },
      { lat: 10.5, lng: true },
      { lat: "hi", lng: -10.5 },
      { lat: true, lng: -10.5 },
    ].map(item => ({ ...baseObj, ...item }));
    expect.assertions(tests.length * 2);
    await Promise.all(
      tests.map(async test => {
        const res = await postSensorPair(test);
        expect(res.status).toBe(400);
        expect(res.body.content).toBeUndefined();
      }),
    );
  });

  test("fails if only one of lat or lng are provided, not both", async () => {
    expect.assertions(4);
    let res = await postSensorPair({ camera_id: 1, motion_id: 1, lat: 10.5 });
    expect(res.status).toBe(400);
    expect(res.body.content).toBeUndefined();
    res = await postSensorPair({ camera_id: 1, motion_id: 1, lat: 10.5 });
    expect(res.status).toBe(400);
    expect(res.body.content).toBeUndefined();
  });
});
