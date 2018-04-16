const { Model } = require("objection");
const uuid = require("uuid");

module.exports = class SensorPair extends Model {
  static get tableName() {
    return "sensorpairs";
  }

  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        lat: { type: "number", default: 0 },
        lng: { type: "number", default: 0 },
        name: { type: "string" },
        camera_id: { type: "integer" },
        motion_id: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const BaseStation = require("./BaseStation");
    return {
      baseStation: {
        relation: Model.BelongsToOneRelation,
        modelClass: BaseStation,
        join: {
          from: "sensorpairs.basestation_id",
          to: "basestations.id",
        },
      },
    };
  }

  async $beforeInsert() {
    this.id = uuid.v4();
  }
};
