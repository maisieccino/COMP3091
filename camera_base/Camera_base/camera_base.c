#include <sys/ioctl.h>
#include <stdio.h>
#include <inttypes.h>
#include <linux/spi/spidev.h>
#include <letmecreate/letmecreate.h>
#include <letmecreate/core/gpio.h>

const uint8_t __CMD_WRITE_REG = 2;
const uint8_t __CMD_READ_REG = 3;
const uint8_t __CMD_GET_FRAME = 4;
const uint8_t __CMD_GET_FRAME_BUFFERED = 5;
const uint8_t __CMD_SET_ROW_NUM = 6;
const uint8_t __CMD_SET_ROW_SIZE = 7;

#define QCIF_WIDTH 176
#define QCIF_HEIGHT 144
#define FRM_WIDTH QCIF_WIDTH
#define FRM_HEIGHT QCIF_HEIGHT

uint8_t bmp_header[10] = {0x10, 0x00, FRM_HEIGHT >> 8, FRM_HEIGHT, FRM_WIDTH >> 8, FRM_WIDTH, 0xFF, 0xFF, 0xFF, 0xFF}; // Header of BMP in QVGA format.

#ifndef MIKROBUS_IDX
#define MIKROBUS_IDX MIKROBUS_1
#endif

int8_t ready_pin;

int ready_pin_init()
{
    if (MIKROBUS_IDX == MIKROBUS_1)
    {
        ready_pin = MIKROBUS_1_INT;
    }
    else if (MIKROBUS_IDX == MIKROBUS_2)
    {
        ready_pin = MIKROBUS_2_INT;
    }
    if (gpio_init(ready_pin) < 0)
    {
        return -1;
    }
    return 0;
}

int check_ready_pin()
{
    uint8_t val = 2;
    uint8_t res = gpio_get_value(ready_pin, &val);
    while (res == 0 && (val == 0))
    {
        res = gpio_get_value(ready_pin, &val);
    }
    if (res != 0)
    {
        return -1;
    }
    if (val == 1)
    {
        return 0;
    }
    return -1;
}

void send_command(uint8_t command)
{
    while (check_ready_pin() != 0)
    {
    }
    printf("send command\n");
    int res = spi_transfer(&command, NULL, 1);
    printf("result: %d\n", res);
}

void read_bytes(uint8_t *ptr, unsigned long num)
{
    while (check_ready_pin() != 0)
    {
    }
    uint8_t *zeros = (uint8_t *)calloc(1, num);
    printf("reading %d bytes\n", num);
    spi_transfer(zeros, ptr, num);
}

void send_bytes(uint8_t *ptr, uint8_t num) {
    while (check_ready_pin() != 0)
    {
    }
    spi_transfer(ptr, NULL, num);
}

uint8_t read_reg(uint8_t reg, uint8_t *val) {
  uint8_t status;
  
  send_command(__CMD_READ_REG);
  send_bytes(&reg, 1);
  read_bytes(&status, 2);
  *val = status & 0xFF;
  return status >> 8;
}

uint8_t *get_camera_data()
{
    uint8_t *res = (uint8_t *)calloc(1, FRM_WIDTH * FRM_HEIGHT * 2);
    // uint8_t *res = (uint8_t *)calloc(1, 10 + (FRM_WIDTH * FRM_HEIGHT * 2));
    if (check_ready_pin() != 0)
    {
        return NULL;
    }
    // for (int i = 0; i < 10; i++)
    // {
    //     res[i] = bmp_header[i];
    // }
    send_command(__CMD_GET_FRAME);
    // read_bytes(res + 10, FRM_WIDTH * FRM_HEIGHT * 2);
    read_bytes(res, FRM_WIDTH * FRM_HEIGHT * 2);
    return res;
}

int main(void)
{
    FILE *output = fopen("./test.bmp", "w");
    printf("initialising spi...\n");
    spi_init();
    spi_select_bus(MIKROBUS_IDX);
    spi_set_speed(MIKROBUS_IDX, SPI_10M93);
    if (spi_set_mode(MIKROBUS_IDX, 3))
    {
        printf("Error setting SPI mode\n");
        return 1;
    }

    printf("initialising ready pin...\n");
    if (ready_pin_init() < 0)
    {
        fprintf(stderr, "can't open ready pin\n");
        return 1;
    }

    printf("attempt to read reg... expecting %d\n", 0x7f);
    uint8_t reg_val = 0;
    read_reg(0x1d, &reg_val);
    printf("...result: %d\n", reg_val);
    printf("Attempting to get camera image...\n");
    printf("god bless this mess.\n");
    uint8_t *res = get_camera_data();
    if (res == NULL)
    {
        printf("something went wrong :(\n");
        return 2;
    }
    fwrite(res, 1, 10 + (FRM_WIDTH * FRM_HEIGHT * 2), output);

    free(res);
    fclose(output);
    spi_release();
    return 0;
}
