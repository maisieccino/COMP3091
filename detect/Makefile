check_defined = \
    $(strip $(foreach 1,$1, \
        $(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = \
    $(if $(value $1),, \
      $(error Undefined $1$(if $2, ($2))))

# check that PAIR_ID and DEVICE_ID are set
$(call check_defined, PAIR_ID, ID of the sensor/camera pair)
$(call check_defined, DEVICE_ID, unique ID of the clicker)

# pass PAIR_ID and DEVICE_ID to gcc
CFLAGS += -DPAIR_ID=$(PAIR_ID)
CFLAGS += -DDEVICE_ID=$(DEVICE_ID)
CFLAGS += -DDEBUG_IP=fe80::19:f5ff:fe89:1af0
CFLAGS += -Wall -Wno-pointer-sign
CFLAGS += -I $(CONTIKI)/platform/$(TARGET)
CFLAGS += -fno-short-double
LDFLAGS += -Wl,--defsym,_min_heap_size=32000

APPS += letmecreateiot

CONTIKI_PROJECT = detect
CONTIKI = /home/mbell/git/contiki
TARGET = mikro-e
USE_AVRDUDE=1
all: $(CONTIKI_PROJECT)

CONTIKI_WITH_IPV6 = 1
include $(CONTIKI)/Makefile.include