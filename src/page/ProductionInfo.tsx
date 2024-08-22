import { Flex } from "@chakra-ui/react"
import { getStorageGoodsWithProductionInfo } from "api/storage/productionInfo"
import { getStorageGoodsCount } from "api/storage/storageGood"
import { Container } from "component/Container"
import { LoadingPage } from "component/page/LoadingPage"
import { Page } from "component/page/Page"
import { PageHeading } from "component/page/PageHeading"
import { Pagination } from "component/page/Pagination"
import { RowsPerPageSelect } from "component/page/RowsPerPageSelect"
import { StorageGoodsWithProductionInfoTable } from "component/productionInfo/StorageGoodsWithProductionInfoTable"
import { Role } from "constant/roles"
import { usePaginationContext } from "context/pagination"
import { withAuthAndRoles } from "hook/withAuthAndRoles"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { StorageGoodWithProductionInfo } from "type/storage/storageGood"

const ProductionInfo = () => {
  const { rowsPerPageCount } = usePaginationContext()

  const [currentPage, setCurrentPage] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)

  const {
    data: goodsWithProductionInfoList,
    isLoading: isLoadingProductionInfo,
    refetch,
    isRefetching,
  } = useQuery<StorageGoodWithProductionInfo[]>(
    "goodsWithProductionInfoList",
    () => getStorageGoodsWithProductionInfo(rowsPerPageCount, offset),
  )
  const isGoodsExist = goodsWithProductionInfoList !== undefined

  const { data: goodsCount, isLoading: isLoadingStorageGoodsCount } =
    useQuery<number>("storageGoodsCount", getStorageGoodsCount)

  const isLoading = isLoadingProductionInfo || isLoadingStorageGoodsCount

  useEffect(() => {
    const newOffset = currentPage * rowsPerPageCount
    setOffset(newOffset)
  }, [currentPage, rowsPerPageCount])

  useEffect(() => {
    refetch()
  }, [refetch, offset, rowsPerPageCount])

  return (
    <Page>
      <PageHeading title="Production Info" isSearchHidden />

      {isLoading && <LoadingPage />}

      {isGoodsExist && (
        <Container>
          <Flex w="full" justifyContent="flex-end">
            <RowsPerPageSelect isLoading={isLoading || isRefetching} />
          </Flex>

          <StorageGoodsWithProductionInfoTable
            goodsWithProductionInfoList={goodsWithProductionInfoList}
          />

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

export default withAuthAndRoles([Role.STORAGER])(ProductionInfo)
