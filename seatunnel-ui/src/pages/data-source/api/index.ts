/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const apiPrefix = '/api/v1/datax/datasource';
function getApi(path: string) {
  return `${apiPrefix}${path}`;
}

const api = {
  // 数据源
  addSource: getApi('/add'),
  cloneSource: getApi('/clone'),
  delSource: getApi('/del'),
  sourcePage: getApi('/page'),
  sourceAll: getApi('/all'),
  editSource: getApi('/edit'),
  tetsSource: getApi(''),
  switchStatus: getApi('/switch'),
  listType: getApi('/type-list')
};

export default api;
