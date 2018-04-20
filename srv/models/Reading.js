const { ValidationError } = require("objection");

/* eslint class-methods-use-this: 0 */
/* eslint no-param-reassign: 0 */
const moment = require("moment");
const { Model } = require("objection");
const uuid = require("uuid");

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
                minimum: 0,
              },
              count: {
                type: "integer",
                minimum: 0,
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

  $beforeValidate(jsonSchema, json) {
    if (json.t) {
      try {
        const newDate = moment(json.t).toISOString();
        if (!newDate) {
          throw new Error("invalid date");
        }
        json.t = newDate;
      } catch (err) {
        throw Model.createValidationError({
          type: "ModelValidation",
          message: "t must be a properly-formatted date",
          data: {
            t: [
              {
                keyword: "format",
                message: "must be a properly-formatted time string",
              },
            ],
          },
        });
      }
    }

    return super.$beforeValidate(jsonSchema, json);
  }

  $afterValidate(json, opt) {
    json.counts = json.counts.filter(el => el.count > 0);

    // check for duplicate species_ids
    const ids = json.counts.map(el => el.species_id);
    if (new Set(ids).size !== ids.length) {
      throw Model.createValidationError({
        type: "modelValidation",
        message: "each `counts` item must have a unique species_id",
        data: {
          counts: [
            {
              keyword: "format",
              message: "each item must have a unique species_id",
            },
          ],
        },
      });
    }
    return super.$afterValidate(json, opt);
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
