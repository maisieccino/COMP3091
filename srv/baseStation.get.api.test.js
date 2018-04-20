const srv = require("./index");
const request = require("supertest").agent(srv.listen());
const uuid = require("uuid");

const tracker = require("mock-knex").getTracker();

tracker.install();

const defaultBaseStation = {
  id: uuid.v4(),
  name: "Test Station",
};

const patchedName = "patched name";

tracker.on("query", (query, step) => {
  switch (step) {
    // return all
    case 1: {
      return query.response([defaultBaseStation]);
    }
    // empty list
    case 2: {
      return query.response([]);
    }
    // get by id
    case 3: {
      expect(query.bindings).toContain(defaultBaseStation.id);
      return query.response(defaultBaseStation);
    }
    // 404
    case 4: {
      return query.response();
    }
    // delete success
    // return rows deleted
    case 5: {
      expect(query.method).toContain("del");
      expect(query.bindings).toContain(defaultBaseStation.id);
      return query.response(1);
    }
    // delete not found
    case 6: {
      return query.response(0);
    }
    // successful patch
    case 7: {
      expect(query.method).toBe("update");
      expect(query.bindings).toContain(defaultBaseStation.id);
      expect(query.bindings).toContain(patchedName);
      return query.response(1);
    }
    case 8: {
      return query.response({ ...defaultBaseStation, name: patchedName });
    }
    // patch not found
    case 9: {
      return query.response(0);
    }
    default: {
      return query.response([]);
    }
  }
});

afterAll(() => {
  tracker.uninstall();
});

describe("GET /basestation/", () => {
  test("returns array of base stations", async () => {
    expect.assertions(3);
    const res = await request.get("/basestation/").accept("application/json");
    expect(res.status).toBe(200);
    expect(res.body.content).toBeInstanceOf(Array);
    expect(res.body.content).toHaveLength(1);
  });

  test("returns empty array when no base stations", async () => {
    expect.assertions(3);
    const res = await request.get("/basestation/").accept("application/json");
    expect(res.status).toBe(200);
    expect(res.body.content).toBeInstanceOf(Array);
    expect(res.body.content).toHaveLength(0);
  });
});

describe("GET /basestation/:id/", () => {
  test("returns base station object", async () => {
    expect.assertions(4);
    const res = await request
      .get(`/basestation/${defaultBaseStation.id}`)
      .accept("application/json");
    expect(res.status).toBe(200);
    expect(typeof res.body.content).toBe("object");
    expect(res.body.content.id).toBe(defaultBaseStation.id);
  });

  test("returns 404 if no base station exists with that id", async () => {
    expect.assertions(2);
    const res = await request
      .get(`/basestation/${uuid.v4()}`)
      .accept("application/json");
    expect(res.status).toBe(404);
    expect(res.body.error).not.toBe("");
  });
});

describe("DELETE /basestation/:id/", () => {
  test("returns 204 if successful delete", async () => {
    expect.assertions(4);
    const res = await request
      .delete(`/basestation/${defaultBaseStation.id}`)
      .accept("application/json");

    expect(res.status).toBe(204);
    expect(res.noContent).toBeTruthy();
  });

  test("returns 404 if base station doesn't exist", async () => {
    expect.assertions(2);
    const res = await request
      .delete(`/basestation/${uuid.v4()}`)
      .accept("application/json");
    expect(res.status).toBe(404);
    expect(res.body.error).not.toBe("");
  });
});

describe("PATCH /basestation/:id/", () => {
  test("updates model if exists", async () => {
    expect.assertions(6);
    const res = await request
      .patch(`/basestation/${defaultBaseStation.id}`)
      .accept("application/json")
      .type("application/json")
      .send({ name: patchedName });
    expect(res.status).toBe(200);
    expect(res.body.content.id).toBe(defaultBaseStation.id);
    expect(res.body.content.name).toBe(patchedName);
  });

  test("returns 404 if it does not exist", async () => {
    expect.assertions(1);
    const res = await request
      .patch(`/basestation/${defaultBaseStation.id}`)
      .accept("application/json")
      .type("application/json")
      .send({ name: patchedName });
    expect(res.status).toBe(404);
  });

  test("returns 400 if improper arguments", async () => {
    expect.assertions(2);
    const res = await request
      .patch(`/basestation/${defaultBaseStation.id}`)
      .accept("application/json")
      .type("application/json")
      .send({ lat: "hello", lng: 10.5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("lat");
  });
});
