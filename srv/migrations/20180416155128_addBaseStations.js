exports.up = knex =>
  knex.schema.createTable("basestations", table => {
    table
      .uuid("id")
      .notNullable()
      .primary();
    table.string("name");
    table.float("lat");
    table.float("lng");
    table.timestamps();
  });

exports.down = knex => knex.schema.dropTable("basestations");
