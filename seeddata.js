const { prisma } = require("./config/prisma");

const seedRoles = async () => {
  try {
    const rolesData = [
      { name: "admin" },
      { name: "user" },
    ];

    // Check if roles already exist
    const existingRoles = await prisma.role.findMany({});
    if (existingRoles.length > 0) {
      console.log("Roles already seeded");
      return existingRoles;
    } else {
      // Seed roles if not existing
      for (const index in rolesData) {
        const role = rolesData[index];
        await prisma.role.create({
          data: role,
        });
        console.log(`Role ${role.name} seeded successfully`);
      }

      // Fetch and return newly created roles
      return await prisma.role.findMany({});
    }
  } catch (error) {
    console.error("Error seeding roles:", error);
  }
};

const seedPermissions = async () => {
  try {
    const permissionsData = [
      { permission: "Read", slug: "read" },
      { permission: "Create", slug: "create" },
      { permission: "Update", slug: "update" },
      { permission: "Delete", slug: "delete" },
    ];

    // Check if permissions already exist
    const existingPermissions = await prisma.permission.findMany({});
    if (existingPermissions.length > 0) {
      console.log("Permissions already seeded");
      return;
    } else {
      // Seed permissions if not existing
      await prisma.permission.createMany({
        data: permissionsData,
        skipDuplicates: true, // Ensures duplicate entries are skipped
      });
      console.log("Permissions seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding permissions:", error);
  }
};

//run seed roles if somwone access this file

const seedRolePermissions = async () => {
  try {
    const rolePermissionsData = [
      { roleId: 1, permissionId: 1 },
      { roleId: 1, permissionId: 2 },
      { roleId: 1, permissionId: 3 },
      { roleId: 1, permissionId: 4 },
      { roleId: 2, permissionId: 1 },
      { roleId: 2, permissionId: 2 },
      { roleId: 2, permissionId: 3 },
    ];

    // Check if role permissions already exist
    const existingRolePermissions = await prisma.rolePermission.findMany({});
    if (existingRolePermissions.length > 0) {
      console.log("Role permissions already seeded");
      return;
    } else {
      // Seed role permissions if not existing
      await prisma.rolePermission.createMany({
        data: rolePermissionsData,
        skipDuplicates: true, // Ensures duplicate entries are skipped
      });
      console.log("Role permissions seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding role permissions:", error);
  }
};

 const usertoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    const user = await prisma.client.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", statusCode: 404 });

    const isAdmin = user.roles.some((role) => role.name === "admin");
    const isUser = user.roles.some((role) => role.name === "user");

    if (isAdmin)
      return res.status(400).json({ error: "User is already an admin" });

    const [adminRole, userRole, customerRole] = await Promise.all([
      prisma.role.findFirst({ where: { name: "admin" } }),
      prisma.role.findFirst({ where: { name: "user" } }),
    ]);

    if (!adminRole)
      return res
        .status(404)
        .json({ message: "Admin role not found", statusCode: 404 });

    const updateRoles = async (disconnectId, connectId) => {
      await prisma.client.update({
        where: { id: userId },
        data: {
          roles: {
            disconnect: { id: disconnectId },
            connect: { id: connectId },
          },
        },
      });
    };

    if (isUser) {
      await updateRoles(userRole.id, adminRole.id);
      return res.json({ message: "User is now an admin", statusCode: 200 });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", statusCode: 500 });
  }
};



// seedRoles().then(()=>{
//   seedPermissions().then(()=>{
//   }).then(()=>{
//     seedRolePermissions()
//   }).catch((err)=>{
//     console.log(err)
//   }).catch((err)=>{
//     console.log(err)
//   })
// }).catch((err)=>{
//   console.log(err)
// })


module.exports = {
  seedRoles,
  seedPermissions,
  seedRolePermissions,
  usertoAdmin,
};