import { GoodInOrder } from "type/order/good"
import { Shop } from "type/shop"
import { WithId } from "type/withId"

export type Order = {
  status: string
  shop_id?: number
  order_id: string
  date: string
  quantity: number
  buyer_paid: number
  tax: number
  shipping: number
  full_fee: number
  profit: number
  shop?: WithId<Shop>
}

export type OrderWithGoods = {
  order: WithId<Order>
  goods_count: number
  order_goods: WithId<GoodInOrder>[]
}

export type OrderSearchFilter = WithId<Order>
