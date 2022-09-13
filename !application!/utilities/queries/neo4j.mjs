export default
"MATCH (n:System)" + 
"MERGE (n)-[:IS_ROLE]->(r:Role{name: n.role})" + 
"RETURN n.hostname, r.name"


// https://hub.docker.com/layers/library/neo4j/latest/images/sha256-80ee2fea2513a976d1d9b1a61981b9fd771f8ed154e37c6ae80e2ce2d0249173?context=explore