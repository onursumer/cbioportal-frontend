import OncoKbAPI from "./OncoKbAPI";
const client = new OncoKbAPI(`//${(window as any)['__ONCOKB_API_ROOT__']}`);
export default client;
