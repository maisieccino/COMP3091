/* eslint-disable class-methods-use-this */
const { ValidationError } = require("objection");

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
        id: { type: "string", format: "uuid", readOnly: true },
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
    const Reading = require("./Reading");
    return {
      baseStation: {
        relation: Model.BelongsToOneRelation,
        modelClass: BaseStation,
        join: {
          from: "sensorpairs.basestation_id",
          to: "basestations.id",
        },
      },
      readings: {
        relation: Model.HasManyRelation,
        modelClass: Reading,
        join: {
          from: "sensorpairs.id",
          to: "readings.sensorpair_id",
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

  $beforeValidate(jsonSchema, json) {
    // both coords set, or none. no inbetween!
    if ((json.lat && !json.lng) || (json.lng && !json.lat)) {
      throw new ValidationError({ statusCode: 400, type: "ModelValidation" });
    }
    return jsonSchema;
  }
};
