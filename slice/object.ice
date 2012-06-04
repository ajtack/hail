sequence<string> StrSeq;

interface Object {
    idempotent void   ice_ping ();
    idempotent bool   ice_isA (string typeID);
    idempotent string ice_id ();
    idempotent StrSeq ice_ids ();
};
