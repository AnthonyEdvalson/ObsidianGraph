import { Op } from "sequelize";

async function main({logs}) {
  let start = new Date();
  let end = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  start.setDate(end.getDate() - 1);
  

  return await logs().findAll({ 
    where: {
      createdAt: { [Op.between]: [start, end]}
    }
  });
}

export default { main };
