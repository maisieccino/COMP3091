const { Model } = require("objection");
const uuid = require("uuid");

module.exports = class SensorPair extends Model {
  static get tableName() {
    return "sensorpairs";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["camera_id", "motion_id"],
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
    this.created_at = new Date().toISOString();
    this.updated_at = this.created_at;
    this.id = uuid.v4();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
};
