import {
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from "@chakra-ui/react"
import { PurchaseDeliveryGoodsSelectList } from "component/purchaseDelivery/PurchaseDeliveryGoodsSelectList"
import { PurchaseDeliveryStatus } from "constant/purchaseStatus"
import { ChangeEvent, FC, useEffect, useState } from "react"
import { FiArrowRight } from "react-icons/fi"
import {
  usePurchaseDeliveryCreateMutation,
  usePurchaseDeliveryUpdateMutation,
} from "service/purchaseDelivery"
import { usePurchaseGoodUpdateMutation } from "service/purchaseGood"
import { titleCase } from "title-case"
import { ModalProps } from "type/modalProps"
import { PurchaseDelivery, PurchaseDeliveryCreate } from "type/purchaseDelivery"
import { PurchaseGood } from "type/purchaseGood"
import { WithId } from "type/withId"
import { notify } from "util/toasts"

interface PurchaseDeliveryModalProps extends ModalProps {
  prevPurchaseDelivery?: WithId<PurchaseDelivery>
  prevGoods?: WithId<PurchaseGood>[]
}

const newPurchaseDelivery: PurchaseDelivery = {
  deadline: Math.floor(Date.now() / 1000),
  after_custom_shipping: 0,
  track_number: "",
  after_custom_track_number: "",
}

export const PurchaseDeliveryModal: FC<PurchaseDeliveryModalProps> = (
  props
) => {
  const { prevPurchaseDelivery, prevGoods, isOpen, onClose } = props

  const isNewPurchaseDelivery = !prevPurchaseDelivery || !prevGoods

  const prevPurchaseDeliveryStatus =
    (prevGoods && titleCase(prevGoods[0].status)) || ""

  const [purchaseDelivery, setPurchaseDelivery] = useState<PurchaseDelivery>(
    prevPurchaseDelivery || newPurchaseDelivery
  )
  const [goods, setGoods] = useState<WithId<PurchaseGood>[]>(prevGoods || [])
  const [deadline, setDeadline] = useState<string>(
    new Date(newPurchaseDelivery.deadline * 1000).toISOString().split("T")[0]
  )
  const [newStatus, setNewStatus] = useState<string>("")

  const purchaseDeliveryCreateMutation = usePurchaseDeliveryCreateMutation()
  const purchaseDeliveryUpdateMutation = usePurchaseDeliveryUpdateMutation()
  const purchaseGoodUpdateMutation = usePurchaseGoodUpdateMutation()

  const isLoading =
    purchaseDeliveryCreateMutation.isLoading ||
    purchaseDeliveryUpdateMutation.isLoading

  const isSaveBtnDisabled = isLoading || goods.length === 0 || !deadline.trim()

  const handlePurchaseDeliveryStatusUpdate = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value
    setNewStatus(newStatus)
  }

  const handlePurchaseDeliveryUpdate = (
    param: string,
    value: number | string
  ) => {
    setPurchaseDelivery((prevPurchaseDelivery) => ({
      ...prevPurchaseDelivery,
      [param]: value,
    }))
  }

  const onPurchaseDeliveryUpdate = async () => {
    const formattedDeadline = new Date(deadline).getTime() / 1000

    if (isNewPurchaseDelivery) {
      const purchaseDeliveryGoodsIds = goods.map((good) => good.id)

      const body: PurchaseDeliveryCreate = {
        purchase_delivery: {
          ...purchaseDelivery,
          deadline: formattedDeadline,
        },
        purchase_delivery_good: purchaseDeliveryGoodsIds,
      }

      await purchaseDeliveryCreateMutation.mutateAsync(body)

      notify("Delivery was created successfully", "success")
    } else {
      const purchaseDeliveryId = prevPurchaseDelivery.id
      const body: WithId<PurchaseDelivery> = {
        ...purchaseDelivery,
        id: purchaseDeliveryId,
        deadline: formattedDeadline,
      }

      await purchaseDeliveryUpdateMutation.mutateAsync(body)

      const isStatusEqual = prevPurchaseDeliveryStatus === newStatus
      const isNewStatusExists = !!newStatus.trim()
      const isStatusChanged = !isStatusEqual && isNewStatusExists
      if (isStatusChanged) {
        goods.forEach(async (good) => {
          const body: WithId<PurchaseGood> = {
            ...good,
            status: newStatus,
          }

          await purchaseGoodUpdateMutation.mutateAsync(body)
        })
      }

      notify(
        `Delivery #${purchaseDeliveryId} was updated successfully`,
        "success"
      )
    }
    onClose()
  }

  useEffect(() => {
    if (isNewPurchaseDelivery) {
      setPurchaseDelivery(newPurchaseDelivery)
      setGoods([])
    } else {
      setPurchaseDelivery(prevPurchaseDelivery)
      setGoods(prevGoods)
    }
    setNewStatus("")
  }, [isOpen, isNewPurchaseDelivery, prevPurchaseDelivery, prevGoods])

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />

      <ModalContent>
        <ModalHeader>
          {isNewPurchaseDelivery
            ? "New Delivery"
            : `Delivery #${prevPurchaseDelivery.id}`}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Flex direction="column" gap={10}>
            <PurchaseDeliveryGoodsSelectList
              selectedGoods={goods}
              setSelectedGoods={setGoods}
            />

            {/* Track Number and Track Number after Custom */}
            <Flex w="full" gap={10}>
              {/* Track Number */}
              <Flex w="full" direction="column" gap={1}>
                <Text fontWeight="bold">Track Number:</Text>

                <Input
                  placeholder="Track Number"
                  value={purchaseDelivery.track_number}
                  type="text"
                  onChange={(e) => {
                    const value = e.target.value
                    handlePurchaseDeliveryUpdate("track_number", value)
                  }}
                />
              </Flex>

              {/* Track Number after Custom */}
              <Flex w="full" direction="column" gap={1}>
                <Text fontWeight="bold">Track Number after Custom:</Text>

                <Input
                  placeholder="Track Number after Custom"
                  value={purchaseDelivery.after_custom_track_number}
                  type="text"
                  onChange={(e) => {
                    const value = e.target.value
                    handlePurchaseDeliveryUpdate(
                      "after_custom_track_number",
                      value
                    )
                  }}
                />
              </Flex>
            </Flex>

            {/* Shipping after Custom and Deadline */}
            <Flex w="full" gap={10}>
              {/* Shipping after Custom */}
              <Flex w="full" direction="column" gap={1}>
                <Text fontWeight="bold">Shipping after Custom:</Text>

                <Input
                  placeholder="Shipping after Custom"
                  value={purchaseDelivery.after_custom_shipping}
                  type="number"
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    handlePurchaseDeliveryUpdate("after_custom_shipping", value)
                  }}
                />
              </Flex>

              {/* Deadline */}
              <Flex w="full" direction="column" gap={1}>
                <Text fontWeight="bold">Deadline:</Text>

                <Input
                  placeholder="Deadline"
                  value={deadline}
                  type="date"
                  onChange={(e) => {
                    const value = e.target.value
                    setDeadline(value)
                  }}
                />
              </Flex>
            </Flex>

            {/* New Status */}
            {!isNewPurchaseDelivery && (
              <Flex w="full" direction="column" gap={5}>
                <Flex alignItems="center" gap={5}>
                  {/* Prev Status */}
                  <Input
                    value={prevPurchaseDeliveryStatus}
                    type="text"
                    isDisabled
                  />

                  {/* Arrow Icon */}
                  <Flex>
                    <FiArrowRight />
                  </Flex>

                  {/* New Status Select */}
                  <FormControl>
                    <Select
                      placeholder="Select new status"
                      value={newStatus}
                      onChange={handlePurchaseDeliveryStatusUpdate}
                      isDisabled={isLoading}
                    >
                      {Object.values(PurchaseDeliveryStatus).map(
                        (status, index) => (
                          <option key={index} value={status}>
                            {titleCase(status)}
                          </option>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Flex>
              </Flex>
            )}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Flex gap={5}>
            <Button
              variant="solid"
              colorScheme="blue"
              onClick={onPurchaseDeliveryUpdate}
              isLoading={isLoading}
              isDisabled={isSaveBtnDisabled}
            >
              Save
            </Button>

            <Button variant="solid" colorScheme="gray" onClick={onClose}>
              Cancel
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
