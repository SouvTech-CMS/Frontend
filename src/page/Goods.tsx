import { Flex } from "@chakra-ui/react"
import { getAllGoods } from "api/order/goods"
import { Container } from "component/Container"
import { GoodsFilters } from "component/good/GoodsFilters"
import { GoodsTable } from "component/good/GoodsTable"
import { LoadingPage } from "component/page/LoadingPage"
import { Page } from "component/page/Page"
import { PageHeading } from "component/page/PageHeading"
import { Pagination } from "component/page/Pagination"
import { RowsPerPageSelect } from "component/page/RowsPerPageSelect"
import { usePaginationContext } from "context/pagination"
import { usePagination } from "hook/usePagination"
import { useShopFilter } from "hook/useShopFilter"
import { useEffect } from "react"
import { useQuery } from "react-query"
import { ApiResponse } from "type/apiResponse"
import { Good } from "type/order/good"
import { PageProps } from "type/page/page"
import { WithId } from "type/withId"

export const Goods = (props: PageProps) => {
  const { guideNotionPageId } = props

  const { currentPage, setCurrentPage, offset, setOffset } = usePagination()
  const { rowsPerPageCount } = usePaginationContext()
  const { selectedShopId, handleShopSelect } = useShopFilter()

  const {
    data: goodsResponse,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<ApiResponse<WithId<Good>[]>>("goodsResponse", () =>
    //* "selectedShopId || undefined" needed to prevent selectedShopId == 0
    getAllGoods(rowsPerPageCount, offset, selectedShopId || undefined),
  )

  const goodsCount = goodsResponse?.count
  const goodsList = goodsResponse?.result

  const isGoodsExist = goodsList !== undefined

  useEffect(() => {
    const newOffset = currentPage * rowsPerPageCount
    setOffset(newOffset)
  }, [setOffset, currentPage, rowsPerPageCount])

  useEffect(() => {
    refetch()
  }, [refetch, offset, rowsPerPageCount, selectedShopId])

  return (
    <Page guideNotionPageId={guideNotionPageId}>
      <PageHeading title="Goods" isSearchHidden />

      {isLoading && <LoadingPage />}

      {isGoodsExist && (
        <Container>
          <Flex w="full" justifyContent="space-between">
            <GoodsFilters handleShopSelect={handleShopSelect} />

            <RowsPerPageSelect isLoading={isLoading || isRefetching} />
          </Flex>

          <GoodsTable goodsList={goodsList} />

          <Pagination
            totalItemsCount={goodsCount}
            currentPage={currentPage}
            handlePageChange={setCurrentPage}
            isLoading={isRefetching}
          />
        </Container>
      )}
    </Page>
  )
}
