import CacheIcon from './CacheIcon';
import ClickhouseIcon from './ClickhouseIcon';
import DaMengIcon from './DamengIcon';
import DB2Icon from './DB2Icon';
import DorisIcon from './DorisIcon';
import ElasticSearchIcon from './ElasticSearchIcon';
import HiveIcon from './HiveIcon';
import KingBaseIcon from './KingBaseIcon';
import MongoDBIcon from './MongoDBIcon';
import MysqlIcon from './MysqlIcon';
import OpenGaussIcon from './OpenGaussIcon';
import OracleIcon from './OracleIcon';
import PsSqlIcon from './PsSqlIcon';
import SQLite from './SQLite';
import SQLServer from './SQLServer';
import StarRocksIcon from './StarRocksIcon';
import TiDBIcon from './TiDBIcon';

interface DatabaseIconsProps {
  dbType: string;
  width: string;
  height: string;
}

const DatabaseIcons = ({ dbType, width, height }: DatabaseIconsProps) => {
  switch (dbType.toLowerCase()) {
    case 'mysql':
      return <MysqlIcon width={width} height={height} />;
    case 'oracle':
      return <OracleIcon width={width} height={height} />;
    case 'doris':
      return <DorisIcon width={width} height={height} />;
    case 'elasticsearch':
      return <ElasticSearchIcon width={width} height={height} />;
    case 'pgsql':
      return <PsSqlIcon width={width} height={height} />;
    case 'opengauss':
      return <OpenGaussIcon width={width} height={height} />;
    case 'sqlite':
      return <SQLite width={width} height={height} />;
    case 'sqlserver':
      return <SQLServer width={width} height={height} />;
    case 'cache':
      return <CacheIcon width={width} height={height} />;
    case 'hive3':
      return <HiveIcon width={width} height={height} />;
    case 'dameng':
      return <DaMengIcon width={width} height={height} />;
    case 'kingbase':
      return <KingBaseIcon width={width} height={height} />;
    case 'mongodb':
      return <MongoDBIcon width={width} height={height} />;
    case 'db2':
      return <DB2Icon width={width} height={height} />;
    case 'starrocks':
      return <StarRocksIcon width={width} height={height} />;
    case 'clickhouse':
      return <ClickhouseIcon width={width} height={height} />;
    case 'dameng':
      return <DaMengIcon width={width} height={height} />;
    case 'tidb':
      return <TiDBIcon width={width} height={height} />;
    default:
      return <MysqlIcon width={width} height={height} />;
  }
};

export default DatabaseIcons;
