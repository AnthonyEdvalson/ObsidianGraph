import { Op } from "sequelize";

async function main({logs}) {
  let start = new Date();
  let end = new Date();
  start.setDate(end.getDate() - 7);

	return today = await logs().findAll({ 
    where: {
      createdAt: { [Op.between]: [start, end]}
    }
  });
}

export default { main };
