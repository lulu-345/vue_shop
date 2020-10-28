<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表表格区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['vcenter', 'bdbottom', index === 0 ? 'bdtop' : '']"
              v-for="(item1, index) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row
                  :class="['vcenter', index2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column
        ><el-table-column label="角色描述" prop="roleDesc"></el-table-column
        ><el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="setRightDialogShow(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分配权限按钮对应的对话框区域 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="clearArrayCloseDialog"
      >
        <!-- 树形结构区域 -->
        <el-tree
          ref="treeRef"
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          default-expand-all
          node-key="id"
          :default-checked-keys="defaultCheckedArray"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 获取到的所有权限数据
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 当前角色中已有的三级节点的id值组成的数组
      defaultCheckedArray: [],
      // 点击分配按钮的那个角色的id
      roleId: ''
    }
  },
  created() {
    // 调用函数获取到角色列表数据
    this.getRolesList()
  },
  methods: {
    // 获取角色列表数据的函数
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      // 请求发送失败给出错误提示
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表数据失败')
      }
      // 请求发送成功
      // 把获取到的数据赋值给私用数据rolesList
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 用户执行删除权限的操作
    async removeRightById(role, id) {
      // 弹出确认框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户点击了取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作')
      }
      // 用户确定要进行删除操作
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      )
      // 删除失败的时候
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 删除成功
      role.children = res.data
      this.$message.success('删除成功')
    },
    // 点击分配权限按钮的时候
    async setRightDialogShow(role) {
      // 让对话框显示出来
      this.setRightDialogVisible = true
      // 发送请求获取到所有的权限数据
      const { data: res } = await this.$http.get('rights/tree')
      // 请求失败的时候
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 请求发送成功，把获取到的数据赋值给私有数据
      this.rightsList = res.data
      // 调用递归函数，得到三级权限的id组成的数组
      this.getDiGuiArr(role, this.defaultCheckedArray)
      // console.log(this.rightsList)
      // 把该角色的id值保存在私有数据中
      this.roleId = role.id
    },
    // 定义一个递归函数用来获取到角色的三级权限id组成的数组
    getDiGuiArr(node, arr) {
      // 如果是三级节点，就往数组里push  id值
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不是三级节点,就循环这个节点让自己调用自己
      node.children.forEach(item => {
        this.getDiGuiArr(item, arr)
      })
    },
    // 关闭对话框的时候清空装有三级权限id值的那个数组
    clearArrayCloseDialog() {
      this.defaultCheckedArray = []
    },
    // 点击了对话框中的确定按钮的时候进行权限分配
    async allotRights() {
      // 传统concat方法来连接两个数组
      // const arr1 = this.$refs.treeRef.getCheckedKeys()
      // const arr2 = this.$refs.treeRef.getHalfCheckedKeys()
      // const newArr = arr1.concat(arr2)
      // 使用数组的展开运算符来连接两个数组
      const newArr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const treeStr = newArr.join()
      // 发送请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: treeStr
        }
      )
      // 请求发送失败的的时候
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      // 请求发送成功的时候
      // 刷新角色列表
      this.getRolesList()
      // 关闭对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
