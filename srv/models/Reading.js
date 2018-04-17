const { Model } = require("objection");
const { v4: uuid } = require("uuid");

module.exports = class Reading extends Model {
  static get tableName() {
    return "readings";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["t", "counts"],
      properties: {
        id: { type: "string", format: "uuid" },
        t: {
          type: "string",
          format: "date-time",
        },
        counts: {
          type: "array",
          items: {
            type: "object",
            required: ["species_id", "count"],
            properties: {
              species_id: {
                type: "integer",
              },
              count: {
                type: "integer",
              },
            },
          },
        },
      },
    };
  }

  static get relationMappings() {
    const SensorPair = require("./SensorPair");
    return {
      source: {
        relation: Model.BelongsToOneRelation,
        modelClass: SensorPair,
        join: {
          from: "readings.sensorpair_id",
          to: "sensorpairs.id",
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
