exports.up = knex =>
  knex.schema.createTable("sensorpairs", table => {
    table
      .uuid("id")
      .notNullable()
      .primary();
    table
      .uuid("basestation_id")
      .references("id")
      .inTable("basestations")
      .notNullable();
    table.float("lat");
    table.float("lng");
    table.string("name");
    table.string("camera_id").notNullable();
    table.string("motion_id").notNullable();
    table.timestamps();
  });

exports.down = knex => knex.schema.dropTable("sensorpairs");
