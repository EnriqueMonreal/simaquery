import SimaQuery from 'facade/simaquery';

const map = M.map({
  container: 'mapjs',
});

const mp = new SimaQuery();

map.addPlugin(mp);
