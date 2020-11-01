<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!--搜索框区域 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @close="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="toAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表表格区域 -->
      <el-table :data="goodsList" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <!-- 商品名称列 -->
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <!-- 商品价格列 -->
        <el-table-column
          width="120px"
          label="商品价格(元)"
          prop="goods_price"
        ></el-table-column>
        <!-- 商品重量列 -->
        <el-table-column
          label="商品重量"
          width="120px"
          prop="goods_weight"
        ></el-table-column>
        <!-- 创建时间列 -->
        <el-table-column label="创建时间" width="170px" prop="add_time">
          <!-- 使用过滤器处理时间格式 -->
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGood(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        pagenum: 1,
        pagesize: 10,
        query: ''
      },
      goodsList: [],
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      // 请求发送失败的时候给出错误提示
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // 请求发送成功
      console.log(res.data)
      // 把商品分类列表数据赋值给私有数据
      this.goodsList = res.data.goods
      // 把数据总条数也赋值给私有数据
      this.total = res.data.total
    },
    // 用户点击分页的显示少条数据的时候
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      // 刷新商品列表数据
      this.getGoodsList()
    },
    // 用户切换到指定页码的时候
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      // 刷新商品列表数据
      this.getGoodsList()
    },
    // 当用户点击了删除按钮的时候
    async removeGood(id) {
      // 弹出确认框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户取消了删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('您已经取消了删除操作')
      }
      // 用户确定要删除
      // 发送请求进行删除操作
      const { data: res } = await this.$http.delete(`goods/${id}`)
      // 请求发送失败的时候
      if (res.meta.status !== 200) {
        return this.$message.error('删除操作失败')
      }
      // 请求发送成功的时候
      // 刷新商品列表
      this.getGoodsList()
      this.$message.success('删除成功')
    },
    // 当点击了添加商品的按钮的时候
    toAddPage() {
      // 编程式路由导航到新的页面
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped></style>
